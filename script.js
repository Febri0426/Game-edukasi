let modeGuru=false;
const guruSection = document.getElementById("guruSection");
function toggleModeGuru(){
  modeGuru = !modeGuru;
  guruSection.classList.toggle("hidden");
  tampilDaftarSoal();
}

// BANK SOAL
let bankSoal = JSON.parse(localStorage.getItem("bankSoal")) || {
  mtk:{kuis:[],game:[]}, indo:{kuis:[],game:[]}, ip:{kuis:[],game:[]}, pai:{kuis:[],game:[]}
};

// TAMBAH SOAL
function tambahSoal(){
  const m = document.getElementById("mapelGuru").value;
  const jenis = document.getElementById("jenisSoal").value;
  const soalBaru = document.getElementById("soalBaru").value;
  const opsiA = document.getElementById("opsiA").value;
  const opsiB = document.getElementById("opsiB").value;
  const opsiC = document.getElementById("opsiC").value;
  const jawabanBenar = parseInt(document.getElementById("jawabanBenar").value);

  bankSoal[m][jenis].push({q:soalBaru,o:[opsiA,opsiB,opsiC],a:jawabanBenar});
  localStorage.setItem("bankSoal", JSON.stringify(bankSoal));

  document.getElementById("soalBaru").value="";
  document.getElementById("opsiA").value="";
  document.getElementById("opsiB").value="";
  document.getElementById("opsiC").value="";
  tampilDaftarSoal();
}

function tampilDaftarSoal(){
  const m = document.getElementById("mapelGuru").value;
  const daftarSoal = document.getElementById("daftarSoal");
  daftarSoal.innerHTML="<h3>📋 Bank Soal</h3>";
  ["kuis","game"].forEach(j=>{
    daftarSoal.innerHTML += `<b>${j.toUpperCase()}</b>`;
    bankSoal[m][j].forEach((s,i)=>{
      daftarSoal.innerHTML += `<p>${i+1}. ${s.q}</p>`;
    });
  });
}

// KELOMPOK
let kelompok=[], giliran=0, mapelAktif=null, modeMain="kuis", soalAcak=[];
const skorArea = document.getElementById("skorArea");
function buatKelompok(){
  kelompok=[]; skorArea.innerHTML="";
  let jumlahKelompok = document.getElementById("jumlahKelompok").value;
  for(let i=0;i<jumlahKelompok;i++){
    kelompok.push({nama:`Kelompok ${i+1}`,skor:0});
    skorArea.innerHTML += `<div>${kelompok[i].nama}<br><span id="skor${i}">0</span></div>`;
  }
}

// BUKA MAPEL
function bukaMapel(m){
  mapelAktif=m;
  modeMain = prompt("Ketik: kuis / game","kuis");
  soalAcak = [...bankSoal[m][modeMain]].sort(()=>Math.random()-0.5);
  giliran=0;
  if(modeMain==="kuis"){
    document.getElementById("kuisSection").classList.remove("hidden");
    document.getElementById("miniGame").classList.add("hidden");
    tampilSoal();
  } else {
    document.getElementById("kuisSection").classList.add("hidden");
    document.getElementById("miniGame").classList.remove("hidden");
    tampilGame();
  }
}

// TAMPIL KUIS
function tampilSoal(){
  if(!soalAcak[giliran]){
    document.getElementById("soal").innerText="Soal habis";
    return;
  }
  document.getElementById("infoKelompok").innerText=`Giliran ${kelompok[giliran].nama}`;
  const s=soalAcak[giliran];
  document.getElementById("soal").innerText=s.q;
  document.getElementById("opsi0").innerText=s.o[0];
  document.getElementById("opsi1").innerText=s.o[1];
  document.getElementById("opsi2").innerText=s.o[2];
  document.getElementById("hasil").innerText="";
}

// JAWAB KUIS
function jawab(p){
  if(p===soalAcak[giliran].a){
    kelompok[giliran].skor++;
    document.getElementById(`skor${giliran}`).innerText=kelompok[giliran].skor;
    document.getElementById("hasil").innerText="🎉 Benar!";
  } else document.getElementById("hasil").innerText="❌ Salah!";
}

// MINI GAME SEDERHANA
function tampilGame(){
  if(!soalAcak[giliran]){
    document.getElementById("judulGame").innerText="Soal habis";
    return;
  }
  document.getElementById("judulGame").innerText=soalAcak[giliran].q;
  const area = document.getElementById("gameArea");
  area.innerHTML="";

  // Contoh mini game random per mapel
  if(mapelAktif==="mtk"){ // Tebak angka
    let input = document.createElement("input"); input.type="number"; input.id="jawabAngka";
    let btn = document.createElement("button"); btn.innerText="Jawab";
    btn.onclick=()=>{cekGameAngka(soalAcak[giliran].o[0])};
    area.appendChild(input); area.appendChild(btn);
  } else if(mapelAktif==="indo"){ // Drag huruf (contoh)
    area.innerHTML="<p>Seret huruf untuk membentuk kata</p>";
  } else if(mapelAktif==="ip"){ // Puzzle gambar
    area.innerHTML="<p>Susun puzzle gambar</p>";
  } else if(mapelAktif==="pai"){ // Tebak ikon
    area.innerHTML="<p>Tebak ikon yang benar</p>";
  }
}

// JAWAB MINI GAME ANGKA
function cekGameAngka(jawab){
  let val = document.getElementById("jawabAngka").value;
  if(val==jawab){
    document.getElementById("hasilGame").innerText="🎉 Benar!";
    kelompok[giliran].skor++;
    document.getElementById(`skor${giliran}`).innerText=kelompok[giliran].skor;
  } else document.getElementById("hasilGame").innerText="❌ Salah!";
}

// LANJUT KE GILIRAN BERIKUTNYA
function lanjut(){
  giliran++;
  if(giliran>=kelompok.length) giliran=0;
  if(modeMain==="kuis") tampilSoal(); else tampilGame();
}

// LIHAT JUARA
function lihatJuara(){
  let max = Math.max(...kelompok.map(k=>k.skor));
  let j = kelompok.filter(k=>k.skor===max).map(k=>k.nama).join(", ");
  alert(`🏆 Juara: ${j}`);
}
