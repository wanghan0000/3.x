import {
    _decorator,
    Component,
    Node,
    v2,
    Sprite,
    assetManager,
    ImageAsset,
    SpriteFrame,
    Texture2D,
    __private,
    AssetManager,
    Asset,
    resources,
} from 'cc';

export class Assets_Options{
    url:string;
    custom?:any;
}

//加载远程资源
export function loadRemoteSource(options:Assets_Options): Promise<{spriteFrame:SpriteFrame,options:Assets_Options}> {
    return new Promise((resolve, reject) => {
        assetManager.loadRemote<ImageAsset>(options.url, (err, imageAsset) => {
            if (err) {
                reject(err);
            } else {
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                resolve({spriteFrame,options});
            }
        });
    });
}

//加载resource 下的资源
export function loadResources(options:Assets_Options):Promise<{spriteFrame:SpriteFrame,options:Assets_Options}> {
    return new Promise((resolve, reject)=>{
        resources.load(options.url,SpriteFrame,(err,spriteFrame)=>{
            if(!err){
                resolve({spriteFrame,options});
            }else{
                reject(err);
            }
        })
    })
}