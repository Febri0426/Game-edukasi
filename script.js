let modeGuru = false;
function toggleModeGuru() {
  document.getElementById("guruSection").classList.toggle("hidden");
  tampilDaftarSoal();
}

// BANK SOAL
let bankSoal = JSON.parse(localStorage.getItem("bankSoal")) || {
  mtk:{kuis:[],game:[]},
  indo:{kuis:[],game:[]},
  ip:{kuis:[],game:[]},
  pai:{kuis:[],game:[]}
};

// TAMBAH SOAL
function tambahSoal() {
  const m = document.getElementById("mapelGuru").value;
  const jenis = document.getElementById("jenisSoal").value;
  const soalBaruVal = document.getElementById("soalBaru").value;
  const opsiAVal = document.getElementById("opsiA").value;
  const opsiBVal = document.getElementById("opsiB").value;
  const opsiCVal = document.getElementById("opsiC").value;
  const jawabanVal = parseInt(document.getElementById("jawabanBenar").value);

  if(!soalBaruVal || !opsiAVal || !opsiBVal || !opsiCVal){
    alert("Harap isi semua kolom!");
    return;
  }

  bankSoal[m][jenis].push({q: soalBaruVal, o: [opsiAVal,opsiBVal,opsiCVal], a: jawabanVal});
  localStorage.setItem("bankSoal", JSON.stringify(bankSoal));

  document.getElementById("soalBaru").value = "";
  document.getElementById("opsiA").value = "";
  document.getElementById("opsiB").value = "";
  document.getElementById("opsiC").value = "";

  tampilDaftarSoal();
}

function tampilDaftarSoal(){
  const m = document.getElementById("mapelGuru").value;
  const daftar = document.getElementById("daftarSoal");
  daftar.innerHTML = "<h3>📋 Bank Soal</h3>";
  ["kuis","game"].forEach(j => {
    daftar.innerHTML += `<b>${j.toUpperCase()}</b>`;
    bankSoal[m][j].forEach((s,i)=>{
      daftar.innerHTML += `<p>${i+1}. ${s.q}</p>`;
    });
  });
}

// KELOMPOK & SKOR
let kelompok=[], giliran=0, mapelAktif=null, modeMain="kuis", soalAcak=[], timerInterval;

function buatKelompok(){
  const jumlah = parseInt(document.getElementById("jumlahKelompok").value);
  kelompok=[]; document.getElementById("skorArea").innerHTML="";
  for(let i=0;i<jumlah;i++){
    kelompok.push({nama:`Kelompok ${i+1}`, skor:0});
    document.getElementById("skorArea").innerHTML += `<div>${kelompok[i].nama}<br><span id="skor${i}">0</span></div>`;
  }
}

// BUKA MAPEL
function bukaMapel(m){
  mapelAktif = m;
  modeMain = prompt("Ketik: kuis / game","kuis");
  soalAcak = [...bankSoal[m][modeMain]].sort(()=>Math.random()-0.5);
  giliran = 0;
  if(modeMain==="kuis"){
    document.getElementById("kuisSection").classList.remove("hidden");
    document.getElementById("miniGame").classList.add("hidden");
  } else {
    document.getElementById("kuisSection").classList.add("hidden");
    document.getElementById("miniGame").classList.remove("hidden");
    jalankanMiniGame();
  }
  mulaiTimer();
  tampilSoal();
}

// KUIS
function tampilSoal(){
  if(!soalAcak[giliran]){
    document.getElementById("soal").innerText = "Soal habis";
    return;
  }
  document.getElementById("infoKelompok").innerText = `Giliran ${kelompok[giliran].nama}`;
  const s = soalAcak[giliran];
  document.getElementById("soal").innerText = s.q;
  document.getElementById("opsi0").innerText = s.o[0];
  document.getElementById("opsi1").innerText = s.o[1];
  document.getElementById("opsi2").innerText = s.o[2];
  document.getElementById("hasil").innerText="";
  mulaiTimer();
}

function jawab(p){
  if(p === soalAcak[giliran].a){
    kelompok[giliran].skor++;
    document.getElementById(`skor${giliran}`).innerText = kelompok[giliran].skor;
    document.getElementById("hasil").innerText="🎉 Benar!";
  } else {
    document.getElementById("hasil").innerText="❌ Salah!";
  }
  clearInterval(timerInterval);
}

function lanjut(){
  giliran++;
  if(giliran >= kelompok.length) giliran = 0;
  if(modeMain==="kuis") tampilSoal();
  else jalankanMiniGame();
}

function lihatJuara(){
  let max = Math.max(...kelompok.map(k=>k.skor));
  let j = kelompok.filter(k=>k.skor===max).map(k=>k.nama).join(", ");
  alert(`🏆 Juara: ${j}`);
}

// TIMER
function mulaiTimer(){
  let waktu = 20;
  clearInterval(timerInterval);
  document.getElementById("timer").innerText = waktu;
  timerInterval = setInterval(()=>{
    waktu--;
    document.getElementById("timer").innerText = waktu;
    if(waktu<=0){
      clearInterval(timerInterval);
      lanjut();
    }
  },1000);
}

// MINI GAME UNIK PER MAPEL
function jalankanMiniGame(){
  const gameArea = document.getElementById("gameArea");
  const judul = document.getElementById("judulGame");
  const hasil = document.getElementById("hasilGame");
  gameArea.innerHTML = ""; hasil.innerText="";
  let s = soalAcak[giliran];
  if(!s) { gameArea.innerHTML="Soal game habis"; return; }

  judul.innerText = `${kelompok[giliran].nama} - ${s.q}`;

  switch(mapelAktif){
    case "mtk": // Tebak Angka
      let target = Math.floor(Math.random()*10)+1;
      gameArea.innerHTML = `<input type="number" id="angka" placeholder="Tebak angka 1-10"><button onclick="cekAngka(${target})">Cek</button>`;
      break;
    case "indo": // Drag & Drop huruf
      let kata = s.o[0]; // opsiA dijadikan kata
      let huruf = kata.split("").sort(()=>Math.random()-0.5);
      huruf.forEach((h,i)=>{
        let span = document.createElement("span");
        span.innerText=h;
        span.setAttribute("draggable","true");
        span.id="h"+i;
        span.addEventListener("dragstart", dragStart);
        gameArea.appendChild(span);
      });
      let dropzone = document.createElement("div");
      dropzone.id="dropzone";
      dropzone.addEventListener("drop", drop);
      dropzone.addEventListener("dragover", allowDrop);
      dropzone.style.marginTop="10px";
      dropzone.style.minHeight="30px";
      dropzone.style.border="1px solid #ccc";
      gameArea.appendChild(dropzone);
      break;
    case "ip": // Puzzle gambar (opsiA = URL)
      let img = document.createElement("img");
      img.src = s.o[0];
      img.style.width="200px";
      img.style.border="2px solid #000";
      gameArea.appendChild(img);
      break;
    case "pai": // Tebak gambar / icon
      gameArea.innerHTML = `<p>${s.o[0]}</p><input id="jawabPai"><button onclick="cekPai('${s.o[1]}')">Cek</button>`;
      break;
  }
}

// MINI GAME FUNCTIONS
function cekAngka(target){
  let val = parseInt(document.getElementById("angka").value);
  if(val===target){
    document.getElementById("hasilGame").innerText="🎉 Benar!";
    kelompok[giliran].skor++;
    document.getElementById(`skor${giliran}`).innerText = kelompok[giliran].skor;
  } else document.getElementById("hasilGame").innerText="❌ Salah!";
}

function allowDrop(ev){ ev.preventDefault(); }
let dragged;
function dragStart(ev){ dragged = ev.target; }
function drop(ev){ 
  ev.preventDefault();
  ev.target.appendChild(dragged);
  let hasil = Array.from(ev.target.children).map(x=>x.innerText).join("");
  if(hasil === soalAcak[giliran].o[0]){
    document.getElementById("hasilGame").innerText="🎉 Benar!";
    kelompok[giliran].skor++;
    document.getElementById(`skor${giliran}`).innerText = kelompok[giliran].skor;
  } else document.getElementById("hasilGame").innerText="";
}

function cekPai(jawab){
  let val = document.getElementById("jawabPai").value;
  if(val.toLowerCase()===jawab.toLowerCase()){
    document.getElementById("hasilGame").innerText="🎉 Benar!";
    kelompok[giliran].skor++;
    document.getElementById(`skor${giliran}`).innerText = kelompok[giliran].skor;
  } else document.getElementById("hasilGame").innerText="❌ Salah!";
}
