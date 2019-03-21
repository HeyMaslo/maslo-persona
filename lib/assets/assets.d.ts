
// just supress TS errors when requiring assets
// assuming that requiring those assets will return such data (e.g. png => url, shader => raw content)

declare module '*.png' {
    const url: string;
    export = url;
}

declare module '*.mp3' {
    const url: string;
    export = url;
}

declare module '*.glsl' {
    const content: string;
    export = content;
}
