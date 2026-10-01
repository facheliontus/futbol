# ⚽ PRO FOOTBALL 3D - Kariyer, Transfer & Online 1v1 Düello

Three.js tabanlı, WebGL destekli, gerçekçi fizik motoruna ve WebRTC P2P Online Çok Oyunculu desteğe sahip 3D Futbol Oyunu.

---

## 🌟 Öne Çıkan Özellikler

1. **🌐 Online 1v1 Oda Sistemi (Multiplayer):**
   - 4 Haneli rastgele oda kodu üretimi (Örn: `7492`).
   - Tek tıkla oda linkini kopyalayıp WhatsApp veya Discord'dan arkadaşa gönderme (`https://projeniz.vercel.app/?room=7492`).
   - WebRTC P2P doğrudan tarayıcılar arası bağlantı ile ultra düşük gecikme (<15ms).
   - 5 Turluk Penaltı & Frikik Düellosu: Bir tur siz Forvet (Şut Çeken), arkadaşınız Kaleci; sonraki tur roller değişir!

2. **🏆 Tek Kişilik Kariyer & Transfer Modu:**
   - Mevki seçimi: **Forvet (ST)**, **Kaleci (GK)** veya **10 Numara (CAM)**.
   - Forma numarası (1-99) ve başlangıç kulübü.
   - Sezon maçları, maç puanlaması ve sezon sonu dev transfer teklifleri (*Real Madrid, Manchester City, Bayern München, Galatasaray, Fenerbahçe, Beşiktaş*).

3. **🌪️ Roberto Carlos & Beckham Falso Fiziği:**
   - 100% öngörülebilir kavis ve aşırtma dinamiği.
   - `Q` / `E` tuşları, Mouse Wheel veya ekrandaki butonlarla falso kontrolü.
   - Kalenin dışına da serbestçe uzanan 3D neon nişan kılavuzu ve hedef nişangahı.

---

## 🚀 Vercel'e Nasıl Dağıtılır (Deploy)?

Proje dosyaları Vercel ile **%100 uyumlu** şekilde hazırlanmıştır (`vercel.json` ve `package.json` dahildir).

### Yöntem 1: GitHub Üzerinden (En Kolay)
1. Bu `futbol-kariyer-3d` klasöründeki dosyaları kendi GitHub hesabınızda bir repoya yükleyin.
2. [vercel.com](https://vercel.com) adresine gidin ve GitHub hesabınızla giriş yapın.
3. **"Add New Project"** butonuna basıp reponuzu seçin.
4. Hiçbir ayarı değiştirmeden **"Deploy"** butonuna basın!
5. 30 saniye içinde oyununuz `https://projeniz.vercel.app` adresinde tüm dünyada canlı yayında!

### Yöntem 2: Vercel CLI ile Terminalden
```bash
npm install -g vercel
vercel
```
Komutlarını çalıştırarak saniyeler içinde canlıya alabilirsiniz.

---

## 💻 Yerel Olarak Çalıştırma

- Windows kullanıcıları doğrudan `oyunu_baslat.bat` dosyasına çift tıklayabilir.
- Veya `index.html` dosyasını doğrudan Chrome / Edge tarayıcısında açabilirsiniz.
