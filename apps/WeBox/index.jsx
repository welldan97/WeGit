// ==WgApp==
// @id WE-WE-WE-WE-WE-WE-BOX
// @name WeBox
// @description Share your files privately
// @icon '\u{1F4E5}'
// @user { "userName": "welldan97" }
// ==/WgApp==

let streamSaver;
// TODO: import https://github.com/jimmywarting/StreamSaver.js
// prettier-ignore
((_,cb)=>streamSaver=cb())('streamSaver',()=>{'use strict'
let mitmTransporter=null
let supportsTransferable=!1
const test=fn=>{try{fn()}catch(e){}}
const ponyfill=window.WebStreamsPolyfill||{}
const isSecureContext=window.isSecureContext
let useBlobFallback=/constructor/i.test(window.HTMLElement)||!!window.safari||!!window.WebKitPoint
const downloadStrategy=isSecureContext||'MozAppearance' in document.documentElement.style?'iframe':'navigate'
const streamSaver={createWriteStream,WritableStream:window.WritableStream||ponyfill.WritableStream,supported:!0,version:{full:'2.0.0',major:2,minor:0,dot:0},mitm:'https://jimmywarting.github.io/StreamSaver.js/mitm.html?version=2.0.0'}
function makeIframe(src){if(!src)throw new Error('meh')
const iframe=document.createElement('iframe')
iframe.hidden=!0
iframe.src=src
iframe.loaded=!1
iframe.name='iframe'
iframe.isIframe=!0
iframe.postMessage=(...args)=>iframe.contentWindow.postMessage(...args)
iframe.addEventListener('load',()=>{iframe.loaded=!0},{once:!0})
document.body.appendChild(iframe)
return iframe}
function makePopup(src){const options='width=200,height=100'
const delegate=document.createDocumentFragment()
const popup={frame:window.open(src,'popup',options),loaded:!1,isIframe:!1,isPopup:!0,remove(){popup.frame.close()},addEventListener(...args){delegate.addEventListener(...args)},dispatchEvent(...args){delegate.dispatchEvent(...args)},removeEventListener(...args){delegate.removeEventListener(...args)},postMessage(...args){popup.frame.postMessage(...args)}}
const onReady=evt=>{if(evt.source===popup.frame){popup.loaded=!0
window.removeEventListener('message',onReady)
popup.dispatchEvent(new Event('load'))}}
window.addEventListener('message',onReady)
return popup}
try{new Response(new ReadableStream())
if(isSecureContext&&!('serviceWorker' in navigator)){useBlobFallback=!0}}catch(err){useBlobFallback=!0}
test(()=>{const{readable}=new TransformStream()
const mc=new MessageChannel()
mc.port1.postMessage(readable,[readable])
mc.port1.close()
mc.port2.close()
supportsTransferable=!0
Object.defineProperty(streamSaver,'TransformStream',{configurable:!1,writable:!1,value:TransformStream})})
function loadTransporter(){if(!mitmTransporter){mitmTransporter=isSecureContext?makeIframe(streamSaver.mitm):makePopup(streamSaver.mitm)}}
function createWriteStream(filename,options,size){let opts={size:null,pathname:null,writableStrategy:undefined,readableStrategy:undefined}
let bytesWritten=0
let downloadUrl=null
let channel=null
let ts=null
if(Number.isFinite(options)){[size,options]=[options,size]
console.warn('[StreamSaver] Depricated pass an object as 2nd argument when creating a write stream')
opts.size=size
opts.writableStrategy=options}else if(options&&options.highWaterMark){console.warn('[StreamSaver] Depricated pass an object as 2nd argument when creating a write stream')
opts.size=size
opts.writableStrategy=options}else{opts=options||{}}
if(!useBlobFallback){loadTransporter()
channel=new MessageChannel()
filename=encodeURIComponent(filename.replace(/\//g,':')).replace(/['()]/g,escape).replace(/\*/g,'%2A')
const response={transferringReadable:supportsTransferable,pathname:opts.pathname||Math.random().toString().slice(-6)+'/'+filename,headers:{'Content-Type':'application/octet-stream; charset=utf-8','Content-Disposition':"attachment; filename*=UTF-8''"+filename}}
if(opts.size){response.headers['Content-Length']=opts.size}
const args=[response,'*',[channel.port2]]
if(supportsTransferable){const transformer=downloadStrategy==='iframe'?undefined:{transform(chunk,controller){bytesWritten+=chunk.length
controller.enqueue(chunk)
if(downloadUrl){location.href=downloadUrl
downloadUrl=null}},flush(){if(downloadUrl){location.href=downloadUrl}}}
ts=new streamSaver.TransformStream(transformer,opts.writableStrategy,opts.readableStrategy)
const readableStream=ts.readable
channel.port1.postMessage({readableStream},[readableStream])}
channel.port1.onmessage=evt=>{if(evt.data.download){if(downloadStrategy==='navigate'){mitmTransporter.remove()
mitmTransporter=null
if(bytesWritten){location.href=evt.data.download}else{downloadUrl=evt.data.download}}else{if(mitmTransporter.isPopup){mitmTransporter.remove()
if(downloadStrategy==='iframe'){makeIframe(streamSaver.mitm)}}
makeIframe(evt.data.download)}}}
if(mitmTransporter.loaded){mitmTransporter.postMessage(...args)}else{mitmTransporter.addEventListener('load',()=>{mitmTransporter.postMessage(...args)},{once:!0})}}
let chunks=[]
return(!useBlobFallback&&ts&&ts.writable)||new streamSaver.WritableStream({write(chunk){if(useBlobFallback){chunks.push(chunk)
return}
channel.port1.postMessage(chunk)
bytesWritten+=chunk.length
if(downloadUrl){location.href=downloadUrl
downloadUrl=null}},close(){if(useBlobFallback){const blob=new Blob(chunks,{type:'application/octet-stream; charset=utf-8'})
const link=document.createElement('a')
link.href=URL.createObjectURL(blob)
link.download=filename
link.click()}else{channel.port1.postMessage('end')}},abort(){chunks=[]
channel.port1.postMessage('abort')
channel.port1.onmessage=null
channel.port1.close()
channel.port2.close()
channel=null}},opts.writableStrategy)}
return streamSaver})

const renderPage = () => `
  <main>
    <div class="container" style="max-width: 720px">
      <div class="row mt-4">
        <div class="col-12">
          <h1>WeBox</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="border border-info p-4 mt-4" id="download-box">
            <h2>Download</h2>
            <span id="file-name">index.html</span>
            <button
              type="button"
              class="btn btn-success btn-lg mt-4 d-block mx-auto"
              id="download-button"
            >
              Download
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <form id="form-file" class="border border-info p-4 mt-4">
            <h3 class="mb-4">Upload:</h3>
            <div class="form-group">
              <input
                id="input-file"
                class="form-control-file"
                type="file"
              >
              <span id="file-size"><span/>
            </div>
              <button
                type="submit"
                class="btn btn-success btn-lg mt-4 d-block mx-auto"
              >
                Share
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
`;

const createPage = () => {
  const parser = new DOMParser();
  const nextDocument = parser.parseFromString(renderPage(), 'text/html');
  const pageContents = nextDocument.body.children[0];

  document.body.appendChild(pageContents);
};

// Source: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/10420404
const humanFileSize = (bytes, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + ' ' + units[u];
};

const main = () => {
  createPage();
  const $formFile = document.getElementById('form-file');
  const $inputFile = document.getElementById('input-file');
  const $fileSize = document.getElementById('file-size');

  const $downloadBox = document.getElementById('download-box');
  const $fileName = document.getElementById('file-name');
  const $downloadButton = document.getElementById('download-button');
  $downloadBox.style.display = 'none';

  let userId = undefined;

  let reader;
  let writer;

  const sendChunk = message => {
    reader.read().then(({ done, value }) => {
      //console.log({ done, value });
      if (done) {
        reader = undefined;
        return AppShell.send(message.path[0], {
          type: 'downloadDone',
          payload: {},
        });
        return;
      }
      AppShell.send(message.path[0], {
        type: 'fileChunk',
        payload: {
          value: Array.from(value),
        },
      });
    });
  };

  const receiveChunk = message => {
    //console.log({ chunk: message.payload.value });
    const nextChunk = new Uint8Array(message.payload.value);
    writer.write(nextChunk).then(() =>
      AppShell.send(message.path[0], {
        type: 'nextFileChunk',
        payload: {},
      }),
    );
  };

  AppShell.on('message', message => {
    const { type, payload } = message;
    if (type === 'publish') {
      userId = message.path[0];
      $downloadBox.style.display = 'block';
      $fileName.innerText = payload.name;
    } else if (type === 'download') {
      reader = $inputFile.files[0].stream().getReader();
      sendChunk(message);
    } else if (type === 'fileChunk') {
      if (!writer) {
        const fileStream = streamSaver.createWriteStream($fileName.innerText);
        writer = fileStream.getWriter();
      }

      receiveChunk(message);
    } else if (type === 'nextFileChunk') {
      sendChunk(message);
    } else if (type === 'downloadDone') {
      writer.close();
      writer = undefined;
    }
  });

  $downloadButton.addEventListener('click', e => {
    AppShell.send(userId, {
      type: 'download',
    });
  });

  $formFile.addEventListener('submit', e => {
    e.preventDefault();
    if (!$inputFile.files[0]) return;

    AppShell.sendAll({
      type: 'publish',
      payload: {
        name: $inputFile.files[0].name,
      },
    });
  });

  $inputFile.addEventListener('change', e => {
    if (!$inputFile.files[0]) return;

    $fileSize.innerText = humanFileSize($inputFile.files[0].size, true);
  });
};

if (typeof module !== 'undefined') module.exports = main;
else main();
