import {chromium} from 'playwright-core';
import type {BrowserContext} from "playwright-core";
import { spawn } from "child_process";
import * as fs from "fs";
import {fileURLToPath} from "node:url"
import {Readable} from "stream"

export interface videoUrls{
    videoUrl: string;
    audioUrl: string;
}

export async function extractInstagramUrl(context: BrowserContext, url: string): Promise<videoUrls> {
    // Setup
    let output : videoUrls = {videoUrl: "", audioUrl: ""};
    let lastUrl: String = "";

    const page = await context.newPage();

    // The actual interesting bit

    const reqExtraction =  new Promise((Resolve) => {
        page.on('request', (request) => {
            if( new RegExp(".*&bytestart=\\d*&byteend=\\d*$").test(request.url()) ){

                let cleanUrl : string = (new RegExp("(.*)&bytestart=\\d*&byteend=\\d*$").exec(request.url())??["null","null"])[1];
                if(lastUrl == "" && cleanUrl != "null"){
                    lastUrl = cleanUrl;
                    output.videoUrl = cleanUrl;
                }
                else if(lastUrl != cleanUrl && lastUrl != "end" && cleanUrl != "null"){
                    output.audioUrl = cleanUrl;
                    lastUrl = "end"
                    Resolve("");
                }
            }
        });
    })
    await page.goto(url);
    await reqExtraction

    await page.close();
    return output;
}

export async function mergeVideoAudioUrl(videoUrl: string, audioUrl: string, func :(stream : Readable) => any){
    const ffmpeg = spawn('ffmpeg',[
        '-i', videoUrl,
        '-i', audioUrl,
        '-c:v',  'copy',
        '-c:a', 'copy',
        '-map', '0:v',
        '-map', '1:a',
        '-f', 'mp4',
        '-movflags', 'frag_keyframe+empty_moov',
        'pipe:1'
    ],)

    // ffmpeg.stdout.pipe(writeableStream.writeableStream);
    // await new Promise( (res) => writeableStream.writeableStream.on('close', res))
    await func(ffmpeg.stdout)
}

if (process.argv[1] == fileURLToPath(import.meta.url)){
    (async ()=>{
        console.log(`!Started ${fileURLToPath(import.meta.url)}`)
        const browser = await chromium.launch()
        const context = await browser.newContext()
        const url = "https://www.instagram.com/reels/DXj8wtpkTqg/"

        const output = await extractInstagramUrl(context, url)
        await context.close();
        await browser.close();

        console.log(`VideoUrl: ${output.videoUrl}\nAudioUrl: ${output.audioUrl}`);
        const ffmpeg = spawn('ffmpeg',[
            '-i', output.videoUrl,
            '-i', output.audioUrl,
            '-c:v',  'copy',
            '-c:a', 'copy',
            '-map', '0:v',
            '-map', '1:a',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe+empty_moov',
            'pipe:1'
        ],)

        const writableStream = fs.createWriteStream("./a.mp4");
        ffmpeg.stdout.pipe(writableStream);
        await new Promise( (res) => writableStream.on('close', res))


    })();
}

