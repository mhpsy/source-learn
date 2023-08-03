function useState<T>(initial: T): [T, (newState: T) => T] {
    let state = initial;
    const setState = (newState: T) => {
        state = newState;
        return state;
    };
    return [state, setState];
}

const [state, setState] = useState<number>(10);

const newState = setState(20);
console.log(newState)