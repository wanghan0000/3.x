
export enum LoogerLevel{
    OFF = 0,
    OPEN = 2,
    FrameWork = 4,
}

export class Logger {
    static minLevel: number = LoogerLevel.OPEN.valueOf();

    static warn(text: any, options = { level: LoogerLevel.OPEN }): void {
        if(options.level <= this.minLevel){
            console.warn(text);
        }
       
    }
    static error(text: any, options= { level: LoogerLevel.OPEN }): void {
        if(options.level <= this.minLevel){
            console.error(text);
        }
    }
    static log(text: any, options= { level: LoogerLevel.OPEN }): void {
        if(options.level <= this.minLevel){
            console.log(text);
        }
    }

    static init(minLevel:number){
        Logger.minLevel = minLevel;
    }
}
