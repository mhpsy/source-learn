class palyShadowEl extends HTMLElement {
    constructor() {
        super();

        //垃圾的要死 浪费时间 弄了半天 他妈的不能用自定义的东西啊？？
        this.title = this.dataset.title
        this.subTitle = this.dataset.subTitle
        this.number = this.dataset.number
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement("div");
        wrapper.classList.add("play-shadow-wrapper");

        const titleNameEl = document.createElement("h1");
        titleNameEl.textContent = this.title;

        wrapper.append(titleNameEl);

        const subTitleEl = document.createElement("h2");
        subTitleEl.textContent = this.subTitle;

        wrapper.append(subTitleEl);

        const numberEl = document.createElement("span")
        numberEl.textContent = this.number;

        wrapper.append(numberEl);

        shadow.append(wrapper)
    }

    // connectedCallback() {
    //     this.title = this.getAttribute('data-title');
    //     this.subTitle = this.getAttribute('data-subTitle');
    //     this.number = this.getAttribute('data-number')
    //     console.log(`title: ${this.title} ,subTitle: ${this.subTitle}, number:${this.number}`);
    // }
}
// const el = new palyShadowEl("title", "subTitle", 100)
customElements.define("test-el", palyShadowEl)