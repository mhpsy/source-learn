import {EventSourceMessage, getBytes, getLines, getMessages} from './parse';

export const EventStreamContentType = 'text/event-stream';

const DefaultRetryInterval = 1000;
const LastEventId = 'last-event-id';

export interface FetchEventSourceInit extends RequestInit {
    /**
     * The request headers. FetchEventSource only supports the Record<string,string> format.
     */
    headers?: Record<string, string>,

    /**
     * Called when a response is received. Use this to validate that the response
     * actually matches what you expect (and throw if it doesn't.) If not provided,
     * will default to a basic validation to ensure the content-type is text/event-stream.
     */
    onopen?: (response: Response) => Promise<void>,

    /**
     * Called when a message is received. NOTE: Unlike the default browser
     * EventSource.onmessage, this callback is called for _all_ events,
     * even ones with a custom `event` field.
     */
    onmessage?: (ev: EventSourceMessage) => void;

    /**
     * Called when a response finishes. If you don't expect the server to kill
     * the connection, you can throw an exception here and retry using onerror.
     */
    onclose?: () => void;

    /**
     * Called when there is any error making the request / processing messages /
     * handling callbacks etc. Use this to control the retry strategy: if the
     * error is fatal, rethrow the error inside the callback to stop the entire
     * operation. Otherwise, you can return an interval (in milliseconds) after
     * which the request will automatically retry (with the last-event-id).
     * If this callback is not specified, or it returns undefined, fetchEventSource
     * will treat every error as retriable and will try again after 1 second.
     */
    onerror?: (err: any) => number | null | undefined | void,

    /**
     * If true, will keep the request open even if the document is hidden.
     * By default, fetchEventSource will close the request and reopen it
     * automatically when the document becomes visible again.
     */
    openWhenHidden?: boolean;

    /** The Fetch function to use. Defaults to window.fetch */
    fetch?: typeof fetch;
}

export function fetchEventSource(input: RequestInfo, {
    signal: inputSignal,// 信号
    headers: inputHeaders,// 请求头
    onopen: inputOnOpen,// 打开
    onmessage,
    onclose,
    onerror,
    openWhenHidden,
    fetch: inputFetch,
    ...rest// 其他
}: FetchEventSourceInit) {
    return new Promise<void>((resolve, reject) => {
        // make a copy of the input headers since we may modify it below:
        const headers = {...inputHeaders};
        if (!headers.accept) {
            // export const EventStreamContentType = 'text/event-stream';
            headers.accept = EventStreamContentType;
        }

        let curRequestController: AbortController;

        function onVisibilityChange() {
            curRequestController.abort(); // close existing request on every visibility change
            //关闭每次可见性更改时的现有请求
            if (!document.hidden) {
                create(); // page is now visible again, recreate request.
                //页面现在再次可见，重新创建请求。
            }
        }

        //如果为true，即使文档隐藏，也将保持请求打开。
        //默认情况下，fetchEventSource将在文档再次可见时自动关闭请求并重新打开它。
        if (!openWhenHidden) { //这个方法不一定会被挂载上的 会看你传入的参数的
            document.addEventListener('visibilitychange', onVisibilityChange);
        }

        // const DefaultRetryInterval = 1000;
        let retryInterval = DefaultRetryInterval;// 重试间隔
        // 用在try case的重试计时器 这个东西居然也是后端传回来的
        let retryTimer = 0;// 重试计时器

        function dispose() {
            // 处理
            // 1. 移除事件监听
            // 2. 清除重试计时器
            // 3. 中止请求
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.clearTimeout(retryTimer);
            curRequestController.abort();
        }

        // if the incoming signal aborts, dispose resources and resolve:
        //如果传入的信号中止，则处理资源并解析：
        inputSignal?.addEventListener('abort', () => {
            //这里其实就是如果传进来的信号中止了，就会调用这个函数
            //实际调用应该是controller.abort();
            //controller 是传入进来的那个AbortController
            dispose();//上面的函数
            resolve(); // don't waste time constructing/logging errors
            //不要浪费时间构造/记录错误 也就是直接调用了resolve
        });

        //fetch和onopen给默认值
        const fetch = inputFetch ?? window.fetch;
        const onopen = inputOnOpen ?? defaultOnOpen;

        async function create() {
            curRequestController = new AbortController();
            //这个就是上面定义的 不管是内部的 dispose 还是外部的 abort
            // 实际都是调用的这个curRequestController的abort方法
            try {
                // fetchEventSource的核心
                // input是传进来的url
                // rest是传进来的其他参数
                // headers是传进来的请求头 或者是默认的请求头
                // curRequestController.signal是上面定义的AbortController的signal
                const response = await fetch(input, {
                    ...rest,
                    headers,
                    signal: curRequestController.signal,
                });

                await onopen(response);//99%的情况都是调用下面定义的defaultOnOpen,如果自己传入的话要注意请求头了
                //因为这个函数一件对请求头进行了验证  一定是text/event-stream
                //如果不是的话就会抛出异常
                //也就是下面的response.body一定是一个ReadableStream

                //这个是调用的另一个文件里面的函数 返回值也是一个promise
                await getBytes(response.body!, getLines(getMessages(id => {
                    if (id) {
                        // store the id and send it back on the next retry:
                        //存储id并在下一次重试时将其发送
                        headers[LastEventId] = id;
                        //这里的headers是上面定义的headers
                    } else {
                        // don't send the last-event-id header anymore:
                        delete headers[LastEventId];
                    }
                }, retry => {
                    retryInterval = retry;
                }, onmessage)));

                onclose?.();
                dispose();
                resolve();
            } catch (err) {
                if (!curRequestController.signal.aborted) {
                    // if we haven't aborted the request ourselves:
                    try {
                        // check if we need to retry:
                        const interval: any = onerror?.(err) ?? retryInterval;
                        window.clearTimeout(retryTimer);
                        retryTimer = window.setTimeout(create, interval);
                    } catch (innerErr) {
                        // we should not retry anymore:
                        dispose();
                        reject(innerErr);
                    }
                }
            }
        }

        create().then(_ => _);//这里的then是为了消除ts的警告 实际没意义
    });
}

function defaultOnOpen(response: Response) {
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith(EventStreamContentType)) {
        // if the server doesn't respond with the correct content-type, abort:
        //如果接收到的的content-type不是text/event-stream，就抛出错误
        throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`);
    }
}
