/**
 * Represents a message sent in an event stream
 * https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format
 */
export interface EventSourceMessage {
    /** The event ID to set the EventSource object's last event ID value. */
    id: string;
    /** A string identifying the type of event described. */
    event: string;
    /** The event data */
    data: string;
    /** The reconnection interval (in milliseconds) to wait before retrying the connection */
    retry?: number;
}


/**
 * Converts a ReadableStream into a callback pattern.
 * @param stream The input ReadableStream.
 * @param onChunk A function that will be called on each new byte chunk in the stream.
 * @returns {Promise<void>} A promise that will be resolved when the stream closes.
 */
export async function getBytes(stream: ReadableStream<Uint8Array>, onChunk: (arr: Uint8Array) => void) {
    const reader = stream.getReader();
    let result: ReadableStreamReadResult<Uint8Array>;
    while (!(result = await reader.read()).done) {
        //常规的读取流里面的数据 并且通过OnChunk回调 传递出去

        //实际onChunk调用的是一个getLines
        //getLines里面的调用的是一个getMessages
        //getMessages里面才会调用onMessage
        onChunk(result.value);
    }
}

const enum ControlChars {
    NewLine = 10,
    CarriageReturn = 13,
    Space = 32,
    Colon = 58,
}

/**
 * Parses arbitary byte chunks into EventSource line buffers.
 * Each line should be of the format "field: value" and ends with \r, \n, or \r\n.
 * @param onLine A function that will be called on each new EventSource line.
 * @returns A function that should be called for each incoming byte chunk.
 */
export function getLines(onLine: (line: Uint8Array, fieldLength: number) => void) {
    //接收的参数是getMessages的返回值 也就是那个有一大堆闭包的那个函数
    //里面第二个参数fieldLength 如果是0 就会调用onMessage 传递出去当前的“行”
    let buffer: Uint8Array | undefined;
    //buffer: Uint8Array | undefined; // buffer of incoming bytes
    let position: number; // current read position
    //当前读取的位置
    let fieldLength: number; // length of the `field` portion of the line
    //当前行的一部分的长度
    let discardTrailingNewline = false;
    //是否丢弃尾部的换行符

    // return a function that can process each incoming byte chunk:
    // 这个方法会被break两次，第一次是找到了当前行的属性部分，第二次是找到了当前行的结尾
    return function onChunk(arr: Uint8Array) {
        if (buffer === undefined) {
            //这大概是第一次调用的时候，还没有buffer
            buffer = arr;
            position = 0;
            fieldLength = -1;
        } else {
            // we're still parsing the old line. Append the new bytes into buffer:
            buffer = concat(buffer, arr);
            // 不是第一次调用，就把新的arr拼接到buffer里面
        }

        const bufLength = buffer.length;
        //buffer的长度
        let lineStart = 0; // index where the current line starts
        //当前行的起始索引

        while (position < bufLength) {
            //如果当前的位置小于buffer的长度
            if (discardTrailingNewline) {
                //如果丢弃尾部的换行符
                /**
                 * 这个是每次进来都要判断的
                 * 如果当前位置的字符是换行符
                 * 就把lineStart设置为当前位置的下一个位置
                 * 然后把discardTrailingNewline设置为false
                 * 这是为了防止连续的换行符 (传输的内容里面有换行符(我认为))
                 */
                if (buffer[position] === ControlChars.NewLine) {
                    lineStart = ++position; // skip to next char
                }

                discardTrailingNewline = false;
            }

            // start looking forward till the end of line:
            let lineEnd = -1; // index of the \r or \n char
            for (; position < bufLength && lineEnd === -1; ++position) {
                //如果当前位置小于buffer的长度 并且lineEnd等于-1
                switch (buffer[position]) {
                    /**
                     * 如果当前位置的字符是冒号
                     * 并且filedLength等于-1
                     * 就把filedLength设置为当前位置减去当前行的起始位置
                     * 这也就找到了当前行的属性部分
                     */
                    case ControlChars.Colon:
                        if (fieldLength === -1) { // first colon in line
                            fieldLength = position - lineStart;
                        }
                        break;
                    // @ts-ignore:7029 \r case below should fallthrough to \n:/
                    case ControlChars.CarriageReturn:
                        discardTrailingNewline = true;
                    case ControlChars.NewLine:
                        lineEnd = position;
                        break;
                    /**
                     * 如果当前位置的字符是回车符
                     * 就把discardTrailingNewline设置为true，下一个循环一进来就会判断是不是newline了
                     if (buffer[position] === ControlChars.NewLine) {
                        lineStart = ++position; // skip to next char
                     }
                     也就是while循环里面的第一个if
                     * 也就是会跳过这个/r/n了
                     */
                }
            }


            if (lineEnd === -1) {
                // We reached the end of the buffer but the line hasn't ended.
                // Wait for the next arr and then continue parsing:
                break;
            }

            // we've reached the line end, send it out:
            onLine(buffer.subarray(lineStart, lineEnd), fieldLength);
            //调用onLine方法，传递出去当前行的内容
            // buffer.subarray(lineStart, lineEnd) 就是当前行的内容 也就是value
            // fieldLength 就是当前行的属性部分的长度
            lineStart = position; // we're now on the next line
            fieldLength = -1;
        }

        if (lineStart === bufLength) {
            buffer = undefined; // we've finished reading it
        } else if (lineStart !== 0) {
            // Create a new view into buffer beginning at lineStart so we don't
            // need to copy over the previous lines when we get the new arr:
            buffer = buffer.subarray(lineStart);
            position -= lineStart;
        }
    }
}

/**
 * Parses line buffers into EventSourceMessages.
 * @param onId A function that will be called on each `id` field.
 * @param onRetry A function that will be called on each `retry` field.
 * @param onMessage A function that will be called on each message.
 * @returns A function that should be called for each incoming line buffer.
 */
export function getMessages(
    onId: (id: string) => void,
    onRetry: (retry: number) => void,
    onMessage?: (msg: EventSourceMessage) => void
) {
    let message = newMessage();
    //{
    //         data: '',
    //         event: '',
    //         id: '',
    //         retry: undefined,
    //     };
    const decoder = new TextDecoder();//解码器

    // return a function that can process each incoming line buffer:
    // 这个方法会闭包上面的message对象、decoder对象、onMessage回调、onRetry回调、onId回调
    //也就是全部的方法都可以用的
    return function onLine(line: Uint8Array, fieldLength: number) {
        // line是一行数据  fieldLength是冒号的位置 都是getLines方法传递过来的
        if (line.length === 0) {
            // empty line denotes end of message. Trigger the callback and start a new message:
            //如果是空行 说明这个消息结束了
            onMessage?.(message);//返回消息 也就是调用了最开始传入进来的onMessage 并把读入的数据传进去
            message = newMessage();//重新创建一个新的消息对象
        } else if (fieldLength > 0) { // exclude comments and lines with no values
            // line is of format "<field>:<value>" or "<field>: <value>"
            // https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation
            const field = decoder.decode(line.subarray(0, fieldLength));
            // 读取冒号前面的数据 也就是field
            const valueOffset = fieldLength + (line[fieldLength + 1] === ControlChars.Space ? 2 : 1);
            // 读取冒号后面的数据 也就是value 如果有空格就+2 没有就+1
            /**
             * 也就是可能是
             * field: value
             * field:value
             * 这两种形式
             */
            const value = decoder.decode(line.subarray(valueOffset));

            switch (field) {
                case 'data':
                    // if this message already has data, append the new value to the old.
                    // otherwise, just set to the new value:
                    message.data = message.data
                        ? message.data + '\n' + value
                        : value; // otherwise, 
                    break;
                case 'event':
                    message.event = value;
                    break;
                case 'id':
                    onId(message.id = value);
                    break;
                case 'retry':
                    const retry = parseInt(value, 10);
                    if (!isNaN(retry)) { // per spec, ignore non-integers
                        onRetry(message.retry = retry);
                    }
                    break;
            }
        }
    }
}

function concat(a: Uint8Array, b: Uint8Array) {
    const res = new Uint8Array(a.length + b.length);
    res.set(a);
    res.set(b, a.length);
    return res;
}

function newMessage(): EventSourceMessage {
    // data, event, and id must be initialized to empty strings:
    // https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation
    // retry should be initialized to undefined so we return a consistent shape
    // to the js engine all the time: https://mathiasbynens.be/notes/shapes-ics#takeaways
    return {
        data: '',
        event: '',
        id: '',
        retry: undefined,
    };
}
