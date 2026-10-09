(() => {
const button=document.querySelector('.share'),status=document.querySelector('.status');
button.addEventListener('click',async()=>{
const data={title:'#PLUGGAINTDEAD 2 — Deric',text:'The tape is out now. Run it.',url:'https://dericmusic.com/pluggaintdead2/'};
try{if(navigator.share){await navigator.share(data);}else if(navigator.clipboard){await navigator.clipboard.writeText(data.url);status.textContent='Link copied. Send it to the real ones.';}else{status.textContent=data.url;}}
catch(error){if(error.name!=='AbortError')status.textContent='Share this link: '+data.url;}
});
})();