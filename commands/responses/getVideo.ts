import {AttachmentBuilder, Message, type OmitPartialGroupDMChannel} from "discord.js";
import {type videoUrls, extractInstagramUrl, mergeVideoAudioUrl, extractTiktokUrl} from "../../modules/videoExtract-api.ts";
import {Readable} from "stream";

export async function getVideo(message :  OmitPartialGroupDMChannel<Message<boolean>>){

    const initialMessage = await message.reply("Working on it..");
    switch ((new RegExp("^(?:http://|https://)([^/]*).*").exec(message.content)?? ["",""])[1]) {
        case "www.instagram.com": {
            const urls : videoUrls = await extractInstagramUrl(message.client.browserContext, (new RegExp("^([^?]*)").exec(message.content)![1]!))
            await mergeVideoAudioUrl(urls.videoUrl, urls.audioUrl, async (stream : Readable)=>{
                await message.reply({content: "", files:[new AttachmentBuilder(stream, {name: "video.mp4"})]})
            })
        }break;

        case "vm.tiktok.com":
        case "www.tiktok.com": {
            const url : videoUrls = await extractTiktokUrl(message.client.browserContext, (new RegExp("^([^?]*)").exec(message.content)![1]!))
            await message.reply({content: "", files:[new AttachmentBuilder(Readable.fromWeb((await fetch(url.videoUrl, {headers: url.videoUrlHeader })).body as any), {name: "video.mp4"})]})
        }break;

    }

    await initialMessage.delete();
}