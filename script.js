let modeGuru = false;
function toggleModeGuru(){
  guruSection.classList.toggle("hidden");
  tampilDaftarSoal();
}

// BANK SOAL (KUIS & GAME)
let bankSoal = JSON.parse(localStorage.getItem("bankSoal")) || {
  mtk:{kuis:[],game:[]},
  indo:{kuis:[],game:[]},
  ip:{kuis:[],game:[]},
  pai:{kuis:[],game:[]}
};

// TAMBAH SOAL
function tambahSoal(){
  const m = mapelGuru.value;
  const jenis = jenisSoal.value;

  bankSoal[m][jenis].push({
    q: soalBaru.value,
    o: [opsiA.value, opsiB.value, opsiC.value],
    a: parseInt(jawabanBenar.value)
  });

  localStorage.setItem("bankSoal", JSON.stringify(bankSoal));

  soalBaru.value = opsiA.value = opsiB.value = opsiC.value = "";
  tampilDaftarSoal();
}

// TAMPIL SOAL DI MODE GURU
function tampilDaftarSoal(){
  const m = mapelGuru.value;
  daftarSoal.innerHTML = "<h3>📋 Bank Soal</h3>";
  ["kuis","game"].forEach(j=>{
    daftarSoal.innerHTML += `<b>${j.toUpperCase()}</b>`;
    bankSoal[m][j].forEach((s,i)=>{
      daftarSoal.innerHTML += `<p>${i+1}. ${s.q}</p>`;
    });
  });
}

// GAME
let kelompok=[], giliran=0, mapelAktif=null, modeMain="kuis", soalAcak=[];

function buatKelompok(){
  kelompok=[];
  skorArea.innerHTML="";
  for(let i=0;i<jumlahKelompok.value;i++){
    kelompok.push({nama:`Kelompok ${i+1}`, skor:0});
    skorArea.innerHTML += `<div>${kelompok[i].nama}<br><span id="skor${i}">0</span></div>`;
  }
}

function bukaMapel(m){
  mapelAktif = m;
  modeMain = prompt("Ketik: kuis / game","kuis");
  soalAcak = [...bankSoal[m][modeMain]].sort(()=>Math.random()-0.5);
  giliran = 0;
  kuisSection.classList.remove("hidden");
  tampilSoal();
}

function tampilSoal(){
  if(!soalAcak[giliran]){
    soal.innerText = "Soal habis";
    return;
  }
  infoKelompok.innerText = `Giliran ${kelompok[giliran].nama}`;
  const s = soalAcak[giliran];
  soal.innerText = s.q;
  opsi0.innerText = s.o[0];
  opsi1.innerText = s.o[1];
  opsi2.innerText = s.o[2];
  hasil.innerText="";
}

function jawab(p){
  if(p === soalAcak[giliran].a){
    kelompok[giliran].skor++;
    document.getElementById(`skor${giliran}`).innerText = kelompok[giliran].skor;
    hasil.innerText="🎉 Benar!";
  } else {
    hasil.innerText="❌ Salah!";
  }
}

function lanjut(){
  giliran++;
  if(giliran >= kelompok.length) giliran = 0;
  tampilSoal();
}

function lihatJuara(){
  let max = Math.max(...kelompok.map(k=>k.skor));
  let j = kelompok.filter(k=>k.skor===max).map(k=>k.nama).join(", ");
  alert(`🏆 Juara: ${j}`);
}
