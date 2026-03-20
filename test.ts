fetch('http://localhost:3000/').then(async r => { console.log(r.status); console.log(await r.text()); }).catch(console.error);
