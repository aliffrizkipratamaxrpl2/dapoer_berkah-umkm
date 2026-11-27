const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ====================================================
// 1. USE CASE DIAGRAM (LENGKAP: PELANGGAN, TRANSAKSI, RIWAYAT PESANAN)
// ====================================================
function getUseCaseDiagram() {
  const cells = [
    `<mxCell id="0" />`,
    `<mxCell id="1" parent="0" />`,
    
    // Header Banner
    `<mxCell id="uc_header" value="&lt;b&gt;&lt;font style=&quot;font-size: 20px;&quot;&gt;USE CASE DIAGRAM - APLIKASI DAPOER BERKAH UMKM&lt;/font&gt;&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 13px; color: #455A64;&quot;&gt;Hak Akses 3 Peran: Admin (Pemilik Toko), Kasir (Pelayan), dan Pelanggan (Konsumen Pembeli)&lt;/font&gt;" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">
      <mxGeometry x="250" y="15" width="760" height="45" as="geometry" />
    </mxCell>`,

    // System Boundary
    `<mxCell id="boundary" value="&lt;b&gt;SISTEM APLIKASI DAPOER BERKAH (FLUTTER + REST API)&lt;/b&gt;" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FAFAFA;strokeColor=#455A64;fontColor=#263238;strokeWidth=2;startSize=35;arcSize=10;rounded=1;collapsible=0;" vertex="1" parent="1">
      <mxGeometry x="270" y="75" width="720" height="920" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // KOTAK 1: FITUR SEMUA PENGGUNA (ADMIN, KASIR, PELANGGAN)
    // ----------------------------------------------------
    `<mxCell id="box_public" value="&lt;b style=&quot;color: #2E7D32;&quot;&gt;1. FITUR BERSAMA (Dapat Diakses Semua Pengguna)&lt;/b&gt;" style="swimlane;whiteSpace=wrap;html=1;fillColor=#E8F5E9;strokeColor=#81C784;fontColor=#1B5E20;startSize=26;rounded=1;collapsible=0;strokeWidth=1.5;" vertex="1" parent="boundary">
      <mxGeometry x="30" y="45" width="660" height="160" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_login" value="&lt;b&gt;1. Registrasi &amp;amp; Login Akun&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #555;&quot;&gt;(Masuk sebagai Admin / Kasir / Pelanggan)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#4CAF50;strokeWidth=1.5;fontColor=#1B5E20;" vertex="1" parent="box_public">
      <mxGeometry x="25" y="38" width="280" height="48" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_view" value="&lt;b&gt;2. Melihat Katalog Menu Makanan&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #555;&quot;&gt;(Lihat nama, foto, harga, dan sisa stok)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#4CAF50;strokeWidth=1.5;fontColor=#1B5E20;" vertex="1" parent="box_public">
      <mxGeometry x="345" y="38" width="290" height="48" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_filter" value="&lt;b&gt;3. Mencari &amp;amp; Memfilter Kategori Menu&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #555;&quot;&gt;(Pilih Makanan Utama, Minuman, atau Cemilan)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#4CAF50;strokeWidth=1.5;fontColor=#1B5E20;" vertex="1" parent="box_public">
      <mxGeometry x="175" y="98" width="310" height="48" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // KOTAK 2: FITUR PEMBELIAN, PEMBAYARAN & RIWAYAT PESANAN
    // ----------------------------------------------------
    `<mxCell id="box_order" value="&lt;b style=&quot;color: #0D47A1;&quot;&gt;2. FITUR TRANSAKSI &amp;amp; RIWAYAT PESANAN (Pelanggan &amp;amp; Kasir)&lt;/b&gt;" style="swimlane;whiteSpace=wrap;html=1;fillColor=#E3F2FD;strokeColor=#64B5F6;fontColor=#0D47A1;startSize=26;rounded=1;collapsible=0;strokeWidth=2;" vertex="1" parent="boundary">
      <mxGeometry x="30" y="225" width="660" height="265" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_buy" value="&lt;b&gt;&lt;font style=&quot;font-size: 13px;&quot;&gt;4. Membeli Menu &amp;amp; Pilih Metode Bayar&lt;/font&gt;&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #1565C0;&quot;&gt;(Pilihan: Tunai, QRIS E-Wallet, atau Transfer Bank)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#BBDEFB;strokeColor=#1976D2;strokeWidth=2;fontColor=#0D47A1;" vertex="1" parent="box_order">
      <mxGeometry x="25" y="45" width="300" height="55" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_stock" value="&lt;b&gt;&lt;font style=&quot;font-size: 13px;&quot;&gt;5. Mengurangi Stok Otomatis&lt;/font&gt;&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #B71C1C;&quot;&gt;(UPDATE products SET stock = stock - qty)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFF3E0;strokeColor=#FF9800;strokeWidth=2;fontColor=#BF360C;" vertex="1" parent="box_order">
      <mxGeometry x="360" y="45" width="275" height="55" as="geometry" />
    </mxCell>`,
    `<mxCell id="inc_buy_stock" value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;" style="edgeStyle=orthogonalEdgeStyle;dashed=1;html=1;endArrow=open;strokeWidth=2;strokeColor=#1976D2;fontColor=#0D47A1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="box_order" source="uc_buy" target="uc_stock">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>`,

    `<mxCell id="uc_cook" value="&lt;b&gt;&lt;font style=&quot;font-size: 13px;&quot;&gt;6. Menunggu Memasak &amp;amp; Siap Dihidangkan&lt;/font&gt;&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #E65100;&quot;&gt;(Timer hitung mundur &amp;amp; status otomatis berubah)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFFDE7;strokeColor=#FBC02D;strokeWidth=1.5;fontColor=#E65100;" vertex="1" parent="box_order">
      <mxGeometry x="25" y="125" width="300" height="55" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_history" value="&lt;b&gt;&lt;font style=&quot;font-size: 13px;&quot;&gt;7. Riwayat Pesanan &amp;amp; Nota Digital&lt;/font&gt;&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #1B5E20;&quot;&gt;(Otomatis masuk riwayat, cek status &amp;amp; nota transaksi)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#C8E6C9;strokeColor=#2E7D32;strokeWidth=2;fontColor=#1B5E20;" vertex="1" parent="box_order">
      <mxGeometry x="360" y="125" width="275" height="55" as="geometry" />
    </mxCell>`,
    `<mxCell id="inc_cook_hist" value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;" style="edgeStyle=orthogonalEdgeStyle;dashed=1;html=1;endArrow=open;strokeWidth=2;strokeColor=#2E7D32;fontColor=#1B5E20;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="box_order" source="uc_cook" target="uc_history">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>`,
    `<mxCell id="note_buy" value="&lt;i&gt;*Saat pembeli bayar, sistem membuat kode pesanan DB-XXXXXX, potong stok otomatis, dan langsung masuk Riwayat Pesanan.*&lt;/i&gt;" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=11;fontColor=#455A64;" vertex="1" parent="box_order">
      <mxGeometry x="15" y="210" width="630" height="30" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // KOTAK 3: FITUR KHUSUS ADMIN (PEMILIK TOKO)
    // ----------------------------------------------------
    `<mxCell id="box_admin" value="&lt;b style=&quot;color: #D84315;&quot;&gt;3. FITUR KELOLA RESTORAN (Khusus Hak Akses Role Admin)&lt;/b&gt;" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFF3E0;strokeColor=#FFB74D;fontColor=#BF360C;startSize=26;rounded=1;collapsible=0;strokeWidth=1.5;" vertex="1" parent="boundary">
      <mxGeometry x="30" y="510" width="660" height="385" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_add" value="&lt;b&gt;8. Menambah Menu Baru &amp;amp; Upload Foto&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #555;&quot;&gt;(Input nama makanan, harga, stok, dan foto kamera/galeri)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FF9800;strokeWidth=1.5;fontColor=#BF360C;" vertex="1" parent="box_admin">
      <mxGeometry x="25" y="45" width="300" height="52" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_edit" value="&lt;b&gt;9. Mengubah Data &amp;amp; Update Stok Menu&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #555;&quot;&gt;(Ganti harga, ubah nama, atau restock barang)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FF9800;strokeWidth=1.5;fontColor=#BF360C;" vertex="1" parent="box_admin">
      <mxGeometry x="345" y="45" width="295" height="52" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_del" value="&lt;b&gt;10. Menghapus Menu Makanan&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #555;&quot;&gt;(Konfirmasi dialog 'Yakin hapus?' &amp;amp; hapus foto fisik)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFEBEE;strokeColor=#E53935;strokeWidth=1.5;fontColor=#C62828;" vertex="1" parent="box_admin">
      <mxGeometry x="25" y="120" width="300" height="52" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_cat" value="&lt;b&gt;11. Mengelola Master Kategori Menu&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #555;&quot;&gt;(Tambah, edit, dan hapus kategori makanan/minuman)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FF9800;strokeWidth=1.5;fontColor=#BF360C;" vertex="1" parent="box_admin">
      <mxGeometry x="345" y="120" width="295" height="52" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_dash" value="&lt;b&gt;12. Memantau Dashboard &amp;amp; Peringatan Stok Menipis&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #555;&quot;&gt;(Melihat total menu, stok &amp;lt; 10 porsi, dan laporan operasional)&lt;/font&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FF9800;strokeWidth=1.5;fontColor=#BF360C;" vertex="1" parent="box_admin">
      <mxGeometry x="145" y="195" width="370" height="55" as="geometry" />
    </mxCell>`,
    `<mxCell id="uc_logout" value="&lt;b&gt;13. Logout Akun&lt;/b&gt; (Hapus Sesi Login Token)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ECEFF1;strokeColor=#78909C;strokeWidth=1;fontColor=#37474F;" vertex="1" parent="box_admin">
      <mxGeometry x="225" y="275" width="210" height="45" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // 3 AKTOR (SISI KIRI)
    // ----------------------------------------------------
    // 1. ADMIN
    `<mxCell id="actor_admin" value="&lt;b&gt;ADMIN&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #E65100;&quot;&gt;Pemilik UMKM&lt;/font&gt;" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#FFE082;strokeColor=#FF8F00;strokeWidth=2.5;fontColor=#BF360C;fontStyle=1;" vertex="1" parent="1">
      <mxGeometry x="70" y="600" width="60" height="110" as="geometry" />
    </mxCell>`,

    // 2. KASIR
    `<mxCell id="actor_kasir" value="&lt;b&gt;KASIR&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #2E7D32;&quot;&gt;Staf Kasir&lt;/font&gt;" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#C8E6C9;strokeColor=#388E3C;strokeWidth=2.5;fontColor=#1B5E20;fontStyle=1;" vertex="1" parent="1">
      <mxGeometry x="70" y="350" width="60" height="110" as="geometry" />
    </mxCell>`,

    // 3. PELANGGAN
    `<mxCell id="actor_pelanggan" value="&lt;b&gt;PELANGGAN&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: #1565C0;&quot;&gt;Konsumen Pembeli&lt;/font&gt;" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#BBDEFB;strokeColor=#1976D2;strokeWidth=2.5;fontColor=#0D47A1;fontStyle=1;" vertex="1" parent="1">
      <mxGeometry x="70" y="140" width="60" height="110" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // GARIS HUBUNG (BERSIH & TERATUR)
    // ----------------------------------------------------
    // Pelanggan -> Kotak 1 (Umum) & Kotak 2 (Beli & Riwayat)
    `<mxCell id="edge_plg_box1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;endArrow=none;strokeColor=#1976D2;strokeWidth=2;" edge="1" parent="1" source="actor_pelanggan" target="box_public"><mxGeometry relative="1" as="geometry" /></mxCell>`,
    `<mxCell id="edge_plg_box2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;entryX=0;entryY=0.35;entryDx=0;entryDy=0;endArrow=none;strokeColor=#1976D2;strokeWidth=2.5;" edge="1" parent="1" source="actor_pelanggan" target="box_order"><mxGeometry relative="1" as="geometry" /></mxCell>`,

    // Kasir -> Kotak 1 (Umum) & Kotak 2 (Beli & Riwayat)
    `<mxCell id="edge_ksr_box1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;entryX=0;entryY=0.8;entryDx=0;entryDy=0;endArrow=none;strokeColor=#2E7D32;strokeWidth=2;" edge="1" parent="1" source="actor_kasir" target="box_public"><mxGeometry relative="1" as="geometry" /></mxCell>`,
    `<mxCell id="edge_ksr_box2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;entryX=0;entryY=0.65;entryDx=0;entryDy=0;endArrow=none;strokeColor=#2E7D32;strokeWidth=2.5;" edge="1" parent="1" source="actor_kasir" target="box_order"><mxGeometry relative="1" as="geometry" /></mxCell>`,

    // Admin -> Kotak 1 (Umum), Kotak 2 (Beli & Riwayat), dan Kotak 3 (Kelola Penuh)
    `<mxCell id="edge_adm_box1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;entryX=0;entryY=0.9;entryDx=0;entryDy=0;endArrow=none;strokeColor=#FF8F00;strokeWidth=1.5;" edge="1" parent="1" source="actor_admin" target="box_public"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="180" y="630"/><mxPoint x="180" y="200"/></Array></mxGeometry></mxCell>`,
    `<mxCell id="edge_adm_box2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;entryX=0;entryY=0.9;entryDx=0;entryDy=0;endArrow=none;strokeColor=#FF8F00;strokeWidth=1.5;" edge="1" parent="1" source="actor_admin" target="box_order"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="200" y="650"/><mxPoint x="200" y="470"/></Array></mxGeometry></mxCell>`,
    `<mxCell id="edge_adm_box3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;endArrow=none;strokeColor=#FF8F00;strokeWidth=3;" edge="1" parent="1" source="actor_admin" target="box_admin"><mxGeometry relative="1" as="geometry" /></mxCell>`,

    // ----------------------------------------------------
    // KOTAK CONTEKAN PRESENTASI (SISI KANAN)
    // ----------------------------------------------------
    `<mxCell id="card_guide" value="&lt;b&gt;&lt;font style=&quot;font-size: 14px; color: #D84315;&quot;&gt;💡 CONTEKAN PRESENTASI KE PENGUJI&lt;/font&gt;&lt;/b&gt;&lt;hr&gt;&lt;br&gt;&lt;b style=&quot;color: #0D47A1;&quot;&gt;1. Pelanggan (Konsumen):&lt;/b&gt;&lt;br&gt;Bisa registrasi akun, melihat katalog menu, memilih jumlah porsi, memilih &lt;b&gt;metode pembayaran&lt;/b&gt; (Tunai, QRIS, Transfer), dan otomatis pesanan masuk ke &lt;b&gt;Riwayat Pesanan&lt;/b&gt; dengan status memasak dan nota digital.&lt;br&gt;&lt;br&gt;&lt;b style=&quot;color: #2E7D32;&quot;&gt;2. Kasir (Pelayan):&lt;/b&gt;&lt;br&gt;Membantu transaksi pemesanan langsung di kasir toko dan memantau status pesanan pelanggan di Riwayat Pesanan.&lt;br&gt;&lt;br&gt;&lt;b style=&quot;color: #E65100;&quot;&gt;3. Admin (Pemilik Usaha):&lt;/b&gt;&lt;br&gt;Memiliki hak akses penuh untuk &lt;b&gt;menambah menu baru beserta foto kamera/galeri&lt;/b&gt;, mengubah harga/stok, menghapus menu, dan mengatur kategori kuliner.&lt;br&gt;&lt;br&gt;&lt;b style=&quot;color: #C62828;&quot;&gt;★ Alur Transaksi Lengkap:&lt;/b&gt;&lt;br&gt;Beli Menu ➔ Pilih Pembayaran ➔ Stok Berkurang Otomatis ➔ Hitung Mundur Memasak ➔ Siap Dihidangkan ➔ Otomatis Masuk Riwayat Pesanan." style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#FFFDE7;strokeColor=#FBC02D;fontColor=#263238;align=left;verticalAlign=top;spacingLeft=12;spacingTop=12;spacingRight=12;strokeWidth=1.5;" vertex="1" parent="1">
      <mxGeometry x="1030" y="100" width="350" height="850" as="geometry" />
    </mxCell>`
  ];

  return `  <diagram id="diagram_usecase" name="1. Use Case Diagram">
    <mxGraphModel dx="1400" dy="1050" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1440" pageHeight="1050" background="#FFFFFF" math="0" shadow="0">
      <root>
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>`;
}

// ====================================================
// 2. ACTIVITY DIAGRAM (ALUR LENGKAP: BELI, BAYAR, DIMASAK, RIWAYAT PESANAN)
// ====================================================
function getActivityDiagram() {
  const cells = [
    `<mxCell id="0" />`,
    `<mxCell id="1" parent="0" />`,

    // Title
    `<mxCell id="act_title" value="&lt;b&gt;&lt;font style=&quot;font-size: 20px;&quot;&gt;ACTIVITY DIAGRAM - 3 ALUR UTAMA SISTEM DAPOER BERKAH&lt;/font&gt;&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 13px; color: #455A64;&quot;&gt;Dilengkapi alur Transaksi Pembayaran, Proses Memasak, dan Otomatis Masuk ke Riwayat Pesanan&lt;/font&gt;" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">
      <mxGeometry x="380" y="15" width="900" height="45" as="geometry" />
    </mxCell>`,

    // =========================================================================
    // ALUR 1 (KIRI - BIRU): PEMBELIAN, PEMBAYARAN, MEMASAK, & RIWAYAT PESANAN
    // =========================================================================
    `<mxCell id="lane_buy" value="&lt;b&gt;ALUR 1: PEMBELIAN, PEMBAYARAN, MEMASAK &amp;amp; RIWAYAT PESANAN&lt;/b&gt;" style="swimlane;whiteSpace=wrap;html=1;fillColor=#E3F2FD;strokeColor=#1976D2;fontColor=#0D47A1;startSize=32;rounded=1;collapsible=0;strokeWidth=2;" vertex="1" parent="1">
      <mxGeometry x="40" y="80" width="520" height="960" as="geometry" />
    </mxCell>`,

    `<mxCell id="start_buy" value="" style="ellipse;html=1;shape=startState;fillColor=#1976D2;strokeColor=#0D47A1;" vertex="1" parent="lane_buy"><mxGeometry x="245" y="45" width="30" height="30" as="geometry" /></mxCell>`,

    // Step 1
    `<mxCell id="step1_buy" value="&lt;b&gt;Langkah 1: Pilih Menu &amp;amp; Jumlah Porsi&lt;/b&gt;&lt;br&gt;Pelanggan menentukan porsi hidangan dengan tombol [+] atau [-]" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#1976D2;arcSize=15;strokeWidth=1.5;" vertex="1" parent="lane_buy">
      <mxGeometry x="95" y="95" width="330" height="45" as="geometry" />
    </mxCell>`,

    // Decision: Cek Stok
    `<mxCell id="dec_buy" value="&lt;b&gt;Apakah Stok&lt;br&gt;Mencukupi?&lt;/b&gt;" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFF9C4;strokeColor=#FBC02D;strokeWidth=2;fontColor=#F57F17;fontStyle=1;" vertex="1" parent="lane_buy">
      <mxGeometry x="185" y="160" width="150" height="60" as="geometry" />
    </mxCell>`,

    // Cabang Stok Habis
    `<mxCell id="warn_habis" value="&lt;b&gt;Stok Tidak Cukup!&lt;/b&gt;&lt;br&gt;Tombol beli dinonaktifkan" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFEBEE;strokeColor=#E53935;arcSize=15;fontColor=#C62828;" vertex="1" parent="lane_buy">
      <mxGeometry x="20" y="240" width="150" height="45" as="geometry" />
    </mxCell>`,

    // Step 2: Pilih Metode Pembayaran
    `<mxCell id="step2_pay" value="&lt;b&gt;Langkah 2: Pilih Metode Transaksi Pembayaran&lt;/b&gt;&lt;br&gt;Pilihan: &lt;b&gt;Tunai (Kasir)&lt;/b&gt;, &lt;b&gt;QRIS (E-Wallet)&lt;/b&gt;, atau &lt;b&gt;Transfer Bank&lt;/b&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#E8F5E9;strokeColor=#2E7D32;arcSize=15;strokeWidth=1.5;fontColor=#1B5E20;" vertex="1" parent="lane_buy">
      <mxGeometry x="190" y="240" width="310" height="50" as="geometry" />
    </mxCell>`,

    // Step 3: Konfirmasi & Bayar
    `<mxCell id="step3_buy" value="&lt;b&gt;Langkah 3: Klik 'Konfirmasi &amp;amp; Bayar'&lt;/b&gt;&lt;br&gt;Backend mencatat nomor pesanan DB-XXXXXX &amp;amp; potong stok otomatis:&lt;br&gt;&lt;font style=&quot;color: #D84315; font-family: monospace;&quot;&gt;&lt;b&gt;UPDATE products SET stock = stock - qty&lt;/b&gt;&lt;/font&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF3E0;strokeColor=#FF9800;arcSize=15;strokeWidth=2;fontColor=#BF360C;" vertex="1" parent="lane_buy">
      <mxGeometry x="65" y="320" width="390" height="65" as="geometry" />
    </mxCell>`,

    // Step 4: Menunggu Beberapa Menit (Memasak)
    `<mxCell id="step4_cook" value="&lt;b&gt;Langkah 4: Menunggu Beberapa Menit (Sedang Dimasak)&lt;/b&gt;&lt;br&gt;Layar HP menampilkan hitung mundur waktu memasak (Timer 3 Menit)&lt;br&gt;&lt;i&gt;Koki Dapoer Berkah sedang meracik hidangan pesanan pelanggan&lt;/i&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFDE7;strokeColor=#FBC02D;arcSize=15;strokeWidth=2;fontColor=#E65100;" vertex="1" parent="lane_buy">
      <mxGeometry x="60" y="415" width="400" height="65" as="geometry" />
    </mxCell>`,

    // Step 5: Menu Sudah Jadi & Siap Dihidangkan
    `<mxCell id="step5_ready" value="&lt;b&gt;Langkah 5: 🎉 Menu Sudah Jadi &amp;amp; Siap Dihidangkan!&lt;/b&gt;&lt;br&gt;Status pesanan di backend otomatis diperbarui menjadi 'Siap Dihidangkan'&lt;br&gt;Pelanggan menerima hidangan di meja makan / konter kasir" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#C8E6C9;strokeColor=#2E7D32;arcSize=15;fontColor=#1B5E20;fontStyle=1;strokeWidth=2;" vertex="1" parent="lane_buy">
      <mxGeometry x="60" y="510" width="400" height="65" as="geometry" />
    </mxCell>`,

    // Step 6: Otomatis Masuk ke Riwayat Pesanan (BARU)
    `<mxCell id="step6_history" value="&lt;b&gt;Langkah 6: Otomatis Masuk ke Riwayat Pesanan 📋&lt;/b&gt;&lt;br&gt;Pelanggan &amp;amp; Kasir dapat membuka Riwayat Pesanan kapan saja:&lt;br&gt;• Melihat kode pesanan DB-XXXXXX &amp;amp; metode pembayaran&lt;br&gt;• Melihat status memasak &amp;amp; rincian nota digital belanja" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#EDE7F6;strokeColor=#512DA8;arcSize=15;fontColor=#311B92;fontStyle=1;strokeWidth=2.5;" vertex="1" parent="lane_buy">
      <mxGeometry x="50" y="605" width="420" height="75" as="geometry" />
    </mxCell>`,

    `<mxCell id="end_buy" value="" style="ellipse;html=1;shape=endState;fillColor=#D32F2F;strokeColor=#B71C1C;" vertex="1" parent="lane_buy"><mxGeometry x="245" y="715" width="30" height="30" as="geometry" /></mxCell>`,

    // Edges Lane 1
    `<mxCell id="e_b1" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_buy" source="start_buy" target="step1_buy"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_b2" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_buy" source="step1_buy" target="dec_buy"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_b3_no" value="Tidak Cukup" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeColor=#E53935;fontColor=#C62828;" edge="1" parent="lane_buy" source="dec_buy" target="warn_habis"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_b3_yes" value="Stok Cukup (Ya)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeColor=#2E7D32;fontColor=#1B5E20;strokeWidth=1.5;" edge="1" parent="lane_buy" source="dec_buy" target="step2_pay"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_b4" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_buy" source="step2_pay" target="step3_buy"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_b5" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=2;strokeColor=#E65100;" edge="1" parent="lane_buy" source="step3_buy" target="step4_cook"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_b6" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=2;strokeColor=#2E7D32;" edge="1" parent="lane_buy" source="step4_cook" target="step5_ready"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_b7" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=2.5;strokeColor=#512DA8;" edge="1" parent="lane_buy" source="step5_ready" target="step6_history"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_b8" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_buy" source="step6_history" target="end_buy"><mxGeometry relative="1" as="geometry"/></mxCell>`,

    // =========================================================================
    // ALUR 2 (TENGAH - HIJAU): AUTENTIKASI LOGIN (SEMUA PENGGUNA)
    // =========================================================================
    `<mxCell id="lane_login" value="&lt;b&gt;ALUR 2: MASUK KE APLIKASI (LOGIN PENGGUNA)&lt;/b&gt;" style="swimlane;whiteSpace=wrap;html=1;fillColor=#E8F5E9;strokeColor=#4CAF50;fontColor=#1B5E20;startSize=32;rounded=1;collapsible=0;strokeWidth=2;" vertex="1" parent="1">
      <mxGeometry x="600" y="80" width="480" height="960" as="geometry" />
    </mxCell>`,

    `<mxCell id="start_login" value="" style="ellipse;html=1;shape=startState;fillColor=#4CAF50;strokeColor=#1B5E20;" vertex="1" parent="lane_login"><mxGeometry x="225" y="45" width="30" height="30" as="geometry" /></mxCell>`,

    `<mxCell id="step1_log" value="&lt;b&gt;Langkah 1: Buka Aplikasi &amp;amp; Cek Indikator Server&lt;/b&gt;&lt;br&gt;Sistem mengecek status backend (🟢 Hijau / 🔴 Merah)&lt;br&gt;Tersedia tombol login cepat: Admin, Kasir, atau Pelanggan" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#4CAF50;arcSize=15;strokeWidth=1.5;" vertex="1" parent="lane_login">
      <mxGeometry x="75" y="100" width="330" height="55" as="geometry" />
    </mxCell>`,

    `<mxCell id="step2_log" value="&lt;b&gt;Langkah 2: Input Email &amp;amp; Password&lt;/b&gt;&lt;br&gt;Pengguna mengisi akun lalu menekan tombol 'Masuk'" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#4CAF50;arcSize=15;strokeWidth=1.5;" vertex="1" parent="lane_login">
      <mxGeometry x="75" y="185" width="330" height="50" as="geometry" />
    </mxCell>`,

    `<mxCell id="dec_log" value="&lt;b&gt;Apakah Email &amp;amp;&lt;br&gt;Password Cocok?&lt;/b&gt;" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFF9C4;strokeColor=#FBC02D;strokeWidth=2;fontColor=#F57F17;fontStyle=1;" vertex="1" parent="lane_login">
      <mxGeometry x="155" y="270" width="170" height="65" as="geometry" />
    </mxCell>`,

    `<mxCell id="err_log" value="&lt;b&gt;Login Gagal!&lt;/b&gt;&lt;br&gt;Tampilkan pesan merah 'Email atau password salah'" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFEBEE;strokeColor=#E53935;arcSize=15;fontColor=#C62828;" vertex="1" parent="lane_login">
      <mxGeometry x="15" y="360" width="170" height="50" as="geometry" />
    </mxCell>`,

    `<mxCell id="step3_log" value="&lt;b&gt;Langkah 3: Verifikasi Berhasil &amp;amp; Simpan Token&lt;/b&gt;&lt;br&gt;Server mengirim token JWT dan data peran pengguna (Role)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#4CAF50;arcSize=15;strokeWidth=1.5;" vertex="1" parent="lane_login">
      <mxGeometry x="225" y="360" width="240" height="50" as="geometry" />
    </mxCell>`,

    `<mxCell id="step4_log" value="&lt;b&gt;Langkah 4: Masuk Halaman Utama Sesuai Role&lt;/b&gt;&lt;br&gt;• Admin: Membuka dashboard kelola menu lengkap&lt;br&gt;• Kasir &amp;amp; Pelanggan: Membuka katalog &amp;amp; Riwayat Pesanan" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#C8E6C9;strokeColor=#2E7D32;arcSize=15;fontColor=#1B5E20;fontStyle=1;strokeWidth=2;" vertex="1" parent="lane_login">
      <mxGeometry x="75" y="445" width="330" height="65" as="geometry" />
    </mxCell>`,

    `<mxCell id="end_log" value="" style="ellipse;html=1;shape=endState;fillColor=#D32F2F;strokeColor=#B71C1C;" vertex="1" parent="lane_login"><mxGeometry x="225" y="550" width="30" height="30" as="geometry" /></mxCell>`,

    // Edges Lane 2
    `<mxCell id="e_l1" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_login" source="start_login" target="step1_log"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_l2" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_login" source="step1_log" target="step2_log"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_l3" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_login" source="step2_log" target="dec_log"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_l4_no" value="Salah" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeColor=#E53935;fontColor=#C62828;" edge="1" parent="lane_login" source="dec_log" target="err_log"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_l4_err_loop" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeColor=#E53935;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="lane_login" source="err_log" target="step2_log"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="45" y="210"/></Array></mxGeometry></mxCell>`,
    `<mxCell id="e_l4_yes" value="Cocok (Benar)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeColor=#2E7D32;fontColor=#1B5E20;strokeWidth=1.5;" edge="1" parent="lane_login" source="dec_log" target="step3_log"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_l5" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_login" source="step3_log" target="step4_log"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_l6" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_login" source="step4_log" target="end_log"><mxGeometry relative="1" as="geometry"/></mxCell>`,

    // =========================================================================
    // ALUR 3 (KANAN - ORANYE): ADMIN MENAMBAH MENU & FOTO
    // =========================================================================
    `<mxCell id="lane_add" value="&lt;b&gt;ALUR 3: MENAMBAH MENU BARU &amp;amp; FOTO (KHUSUS ADMIN)&lt;/b&gt;" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFF3E0;strokeColor=#FF9800;fontColor=#BF360C;startSize=32;rounded=1;collapsible=0;strokeWidth=2;" vertex="1" parent="1">
      <mxGeometry x="1120" y="80" width="480" height="960" as="geometry" />
    </mxCell>`,

    `<mxCell id="start_add" value="" style="ellipse;html=1;shape=startState;fillColor=#FF9800;strokeColor=#BF360C;" vertex="1" parent="lane_add"><mxGeometry x="225" y="45" width="30" height="30" as="geometry" /></mxCell>`,

    `<mxCell id="step1_add" value="&lt;b&gt;Langkah 1: Tekan Tombol Tambah [+]&lt;/b&gt;&lt;br&gt;Admin membuka halaman Form Tambah Menu di aplikasi" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FF9800;arcSize=15;strokeWidth=1.5;" vertex="1" parent="lane_add">
      <mxGeometry x="75" y="100" width="330" height="50" as="geometry" />
    </mxCell>`,

    `<mxCell id="step2_add" value="&lt;b&gt;Langkah 2: Isi Data Menu Kuliner&lt;/b&gt;&lt;br&gt;Input Kategori, Nama Menu, Harga (Rp), dan Stok Awal" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FF9800;arcSize=15;strokeWidth=1.5;" vertex="1" parent="lane_add">
      <mxGeometry x="75" y="180" width="330" height="50" as="geometry" />
    </mxCell>`,

    `<mxCell id="step3_add" value="&lt;b&gt;Langkah 3: Pilih Foto dari Kamera / Galeri&lt;/b&gt;&lt;br&gt;Mengambil foto makanan langsung atau memilih file dari galeri HP" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FF9800;arcSize=15;strokeWidth=1.5;" vertex="1" parent="lane_add">
      <mxGeometry x="75" y="260" width="330" height="50" as="geometry" />
    </mxCell>`,

    `<mxCell id="step4_add" value="&lt;b&gt;Langkah 4: Tekan Tombol 'Simpan Menu'&lt;/b&gt;&lt;br&gt;Aplikasi mengunggah file foto dan data ke server backend" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FF9800;arcSize=15;strokeWidth=1.5;" vertex="1" parent="lane_add">
      <mxGeometry x="75" y="340" width="330" height="50" as="geometry" />
    </mxCell>`,

    `<mxCell id="step5_add" value="&lt;b&gt;Langkah 5: Simpan ke Database Aiven Cloud&lt;/b&gt;&lt;br&gt;Backend menyimpan foto ke folder uploads dan data ke tabel products" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFE0B2;strokeColor=#FB8C00;arcSize=15;strokeWidth=2;fontColor=#E65100;" vertex="1" parent="lane_add">
      <mxGeometry x="65" y="420" width="350" height="55" as="geometry" />
    </mxCell>`,

    `<mxCell id="step6_add" value="&lt;b&gt;Langkah 6: Menu Baru Muncul di Katalog&lt;/b&gt;&lt;br&gt;Katalog menu otomatis me-refresh dan menampilkan hidangan baru" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#C8E6C9;strokeColor=#2E7D32;arcSize=15;fontColor=#1B5E20;fontStyle=1;strokeWidth=2;" vertex="1" parent="lane_add">
      <mxGeometry x="75" y="505" width="330" height="55" as="geometry" />
    </mxCell>`,

    `<mxCell id="end_add" value="" style="ellipse;html=1;shape=endState;fillColor=#D32F2F;strokeColor=#B71C1C;" vertex="1" parent="lane_add"><mxGeometry x="225" y="590" width="30" height="30" as="geometry" /></mxCell>`,

    // Edges Lane 3
    `<mxCell id="e_a1" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_add" source="start_add" target="step1_add"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_a2" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_add" source="step1_add" target="step2_add"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_a3" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_add" source="step2_add" target="step3_add"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_a4" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_add" source="step3_add" target="step4_add"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_a5" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=2;strokeColor=#E65100;" edge="1" parent="lane_add" source="step4_add" target="step5_add"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_a6" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=2;strokeColor=#2E7D32;" edge="1" parent="lane_add" source="step5_add" target="step6_add"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    `<mxCell id="e_a7" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=1.5;" edge="1" parent="lane_add" source="step6_add" target="end_add"><mxGeometry relative="1" as="geometry"/></mxCell>`
  ];

  return `  <diagram id="diagram_activity" name="2. Activity Diagram">
    <mxGraphModel dx="1600" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1680" pageHeight="1100" background="#FFFFFF" math="0" shadow="0">
      <root>
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>`;
}

// ====================================================
// 3. CLASS DIAGRAM (STRUKTUR LENGKAP: PENGGUNA, KATEGORI, PRODUK, & PESANAN)
// ====================================================
function getClassDiagram() {
  const cells = [
    `<mxCell id="0" />`,
    `<mxCell id="1" parent="0" />`,

    // Title
    `<mxCell id="cls_title" value="&lt;b&gt;&lt;font style=&quot;font-size: 20px;&quot;&gt;CLASS DIAGRAM - STRUKTUR KELAS APLIKASI DAPOER BERKAH&lt;/font&gt;&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 13px; color: #455A64;&quot;&gt;Arsitektur Model OOP: Pengguna (UserModel), Kategori (CategoryModel), Produk (ProductModel), dan Pesanan (OrderModel)&lt;/font&gt;" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">
      <mxGeometry x="300" y="15" width="850" height="45" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // CLASS 1: PENGGUNA (USER)
    // ----------------------------------------------------
    `<mxCell id="cls_user" value="&lt;b&gt;Pengguna (UserModel)&lt;/b&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=28;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;fillColor=#E3F2FD;strokeColor=#1976D2;fontColor=#0D47A1;strokeWidth=1.5;" vertex="1" parent="1">
      <mxGeometry x="50" y="90" width="270" height="240" as="geometry" />
    </mxCell>`,
    `<mxCell id="u_attrs" value="+ id : int&#xa;+ nama : String&#xa;+ email : String&#xa;+ role : String ('admin' | 'kasir' | 'pelanggan')&#xa;+ isAdmin : bool&#xa;+ isKasir : bool&#xa;+ isPelanggan : bool" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="cls_user">
      <mxGeometry y="28" width="270" height="110" as="geometry" />
    </mxCell>`,
    `<mxCell id="u_line" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;" vertex="1" parent="cls_user"><mxGeometry y="138" width="270" height="6" as="geometry" /></mxCell>`,
    `<mxCell id="u_methods" value="+ login(email, password) : bool&#xa;+ registrasi(nama, email, pass) : bool&#xa;+ logout() : void" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="cls_user">
      <mxGeometry y="144" width="270" height="96" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // CLASS 2: KATEGORI MENU (CATEGORY)
    // ----------------------------------------------------
    `<mxCell id="cls_cat" value="&lt;b&gt;KategoriMenu (CategoryModel)&lt;/b&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=28;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;fillColor=#E8F5E9;strokeColor=#388E3C;fontColor=#1B5E20;strokeWidth=1.5;" vertex="1" parent="1">
      <mxGeometry x="380" y="90" width="270" height="230" as="geometry" />
    </mxCell>`,
    `<mxCell id="c_attrs" value="+ id : int&#xa;+ namaKategori : String&#xa;+ deskripsi : String&#xa;+ totalProduk : int" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="cls_cat">
      <mxGeometry y="28" width="270" height="80" as="geometry" />
    </mxCell>`,
    `<mxCell id="c_line" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;" vertex="1" parent="cls_cat"><mxGeometry y="108" width="270" height="6" as="geometry" /></mxCell>`,
    `<mxCell id="c_methods" value="+ ambilSemuaKategori() : List&#xa;+ tambahKategori(nama, desk) : bool&#xa;+ editKategori(id, nama, desk) : bool&#xa;+ hapusKategori(id) : bool" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="cls_cat">
      <mxGeometry y="114" width="270" height="116" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // CLASS 3: PRODUK MENU MAKANAN (PRODUCT)
    // ----------------------------------------------------
    `<mxCell id="cls_prod" value="&lt;b&gt;ProdukMenu (ProductModel)&lt;/b&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=28;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;fillColor=#FFF3E0;strokeColor=#F57C00;fontColor=#BF360C;strokeWidth=2;" vertex="1" parent="1">
      <mxGeometry x="710" y="90" width="310" height="280" as="geometry" />
    </mxCell>`,
    `<mxCell id="p_attrs" value="+ id : int&#xa;+ categoryId : int&#xa;+ namaMenu : String&#xa;+ harga : double&#xa;&lt;b style=&quot;color: #D84315;&quot;&gt;+ stok : int (Sisa Porsi Makanan)&lt;/b&gt;&#xa;+ fotoUrl : String&#xa;+ deskripsi : String" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="cls_prod">
      <mxGeometry y="28" width="310" height="120" as="geometry" />
    </mxCell>`,
    `<mxCell id="p_line" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;" vertex="1" parent="cls_prod"><mxGeometry y="148" width="310" height="6" as="geometry" /></mxCell>`,
    `<mxCell id="p_methods" value="+ ambilDaftarMenu() : List&#xa;+ tambahMenu(data, fileFoto) : bool&#xa;+ editMenu(id, data, fileFoto) : bool&#xa;+ hapusMenu(id) : bool&#xa;&lt;b style=&quot;color: #0D47A1;&quot;&gt;+ kurangiStok(jumlahBeli) : bool&lt;/b&gt;" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="cls_prod">
      <mxGeometry y="154" width="310" height="126" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // CLASS 4: PESANAN & RIWAYAT (ORDER MODEL)
    // ----------------------------------------------------
    `<mxCell id="cls_order" value="&lt;b&gt;Pesanan &amp;amp; Riwayat (OrderModel)&lt;/b&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=28;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;fillColor=#EDE7F6;strokeColor=#512DA8;fontColor=#311B92;strokeWidth=2;" vertex="1" parent="1">
      <mxGeometry x="380" y="440" width="320" height="280" as="geometry" />
    </mxCell>`,
    `<mxCell id="o_attrs" value="+ id : int&#xa;+ orderNumber : String (Contoh: DB-727716)&#xa;+ userId : int&#xa;+ buyerName : String&#xa;+ productName : String&#xa;+ quantity : int&#xa;+ totalPrice : double&#xa;+ paymentMethod : String ('Tunai'|'QRIS'|'Transfer')&#xa;+ status : String ('Sedang Dimasak'|'Siap Dihidangkan')&#xa;+ createdAt : DateTime" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="cls_order">
      <mxGeometry y="28" width="320" height="165" as="geometry" />
    </mxCell>`,
    `<mxCell id="o_line" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;" vertex="1" parent="cls_order"><mxGeometry y="193" width="320" height="6" as="geometry" /></mxCell>`,
    `<mxCell id="o_methods" value="+ buatPesananBaru() : bool&#xa;+ ambilRiwayatPesanan() : List&lt;OrderModel&gt;&#xa;+ updateStatusPesanan(status) : bool" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="cls_order">
      <mxGeometry y="199" width="320" height="81" as="geometry" />
    </mxCell>`,

    // ----------------------------------------------------
    // RELASI ANTAR KELAS
    // ----------------------------------------------------
    // Kategori menaungi Produk (1 to Many)
    `<mxCell id="rel_cat_prod" value="1              1..*&#xa;menaungi" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;strokeWidth=2;strokeColor=#388E3C;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="cls_cat" target="cls_prod">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>`,

    // Pengguna membuat Pesanan (1 to Many)
    `<mxCell id="rel_user_order" value="1&#xa;memesan&#xa;&#xa;1..*" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=2;strokeColor=#1976D2;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="cls_user" target="cls_order">
      <mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="185" y="580"/></Array></mxGeometry>
    </mxCell>`,

    // Pesanan berisi Produk & memotong stok (Many to 1)
    `<mxCell id="rel_order_prod" value="memesan item &amp;amp;&#xa;memotong stok" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;strokeWidth=2.5;strokeColor=#D84315;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;" edge="1" parent="1" source="cls_order" target="cls_prod">
      <mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="865" y="580"/></Array></mxGeometry>
    </mxCell>`,

    // ----------------------------------------------------
    // PENJELASAN PADA DIAGRAM (NOTE CARD)
    // ----------------------------------------------------
    `<mxCell id="cls_note" value="&lt;b&gt;CARA MEMAHAMI STRUKTUR KELAS INI:&lt;/b&gt;&lt;br&gt;&lt;br&gt;1. &lt;b&gt;Pengguna (UserModel)&lt;/b&gt;: Mewakili akun yang login (Admin, Kasir, atau Pelanggan).&lt;br&gt;2. &lt;b&gt;KategoriMenu (CategoryModel)&lt;/b&gt;: Mengelompokkan jenis makanan, misalnya 'Makanan Utama' atau 'Minuman Segar'.&lt;br&gt;3. &lt;b&gt;ProdukMenu (ProductModel)&lt;/b&gt;: Data hidangan kuliner yang dijual, memiliki harga dan sisa stok.&lt;br&gt;4. &lt;b&gt;Pesanan (OrderModel)&lt;/b&gt;: Mencatat transaksi belanja pelanggan, nomor pesanan DB-XXXXXX, metode bayar (Tunai/QRIS/Transfer), status memasak, dan otomatis masuk ke Riwayat Pesanan." style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#FFFDE7;strokeColor=#FBC02D;fontColor=#263238;align=left;verticalAlign=top;spacingLeft=14;spacingTop=12;spacingRight=12;" vertex="1" parent="1">
      <mxGeometry x="1070" y="100" width="310" height="620" as="geometry" />
    </mxCell>`
  ];

  return `  <diagram id="diagram_class" name="3. Class Diagram">
    <mxGraphModel dx="1450" dy="950" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1440" pageHeight="880" background="#FFFFFF" math="0" shadow="0">
      <root>
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>`;
}

// ====================================================
// 4. ERD DATABASE DIAGRAM (ENTITY RELATIONSHIP)
// Tetap 3 Tabel Bersih sesuai Permintaan User + Note Pengurangan Stok & Riwayat
// ====================================================
function getErdDiagram() {
  const cells = [
    `<mxCell id="0" />`,
    `<mxCell id="1" parent="0" />`,

    // Title
    `<mxCell id="erd_title" value="&lt;b&gt;&lt;font style=&quot;font-size: 18px;&quot;&gt;ENTITY RELATIONSHIP DIAGRAM (ERD) - DATABASE DAPOER BERKAH&lt;/font&gt;&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 12px; color: #546E7A;&quot;&gt;Struktur Relasi Tabel MySQL pada Aiven Cloud: Akun Pengguna (Role Pelanggan), Kategori, dan Produk Kuliner&lt;/font&gt;" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">
      <mxGeometry x="300" y="20" width="670" height="40" as="geometry" />
    </mxCell>`,

    // Entity 1: users (Updated role ENUM with pelanggan)
    `<mxCell id="ent_users" value="&lt;b&gt;users&lt;/b&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=28;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;fillColor=#E8EAF6;strokeColor=#3F51B5;fontColor=#1A237E;" vertex="1" parent="1">
      <mxGeometry x="60" y="100" width="340" height="240" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_users_1" value="PK | id : INT (AUTO_INCREMENT)" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;overflow=hidden;rotatable=0;fontStyle=1;fontColor=#B71C1C;" vertex="1" parent="ent_users">
      <mxGeometry y="28" width="340" height="26" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_users_div1" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;" vertex="1" parent="ent_users">
      <mxGeometry y="54" width="340" height="6" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_users_fields" value="   name : VARCHAR(100) NOT NULL (Nama Lengkap)&#xa;UK | email : VARCHAR(100) NOT NULL UNIQUE&#xa;   password : VARCHAR(255) NOT NULL (Bcrypt 10 rounds)&#xa;&lt;b style=&quot;color: #0D47A1;&quot;&gt;   role : ENUM('admin','kasir','pelanggan') DEFAULT 'pelanggan'&lt;/b&gt;&#xa;   created_at : TIMESTAMP DEFAULT CURRENT_TIMESTAMP&#xa;   updated_at : TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="ent_users">
      <mxGeometry y="60" width="340" height="180" as="geometry" />
    </mxCell>`,

    // Entity 2: categories
    `<mxCell id="ent_categories" value="&lt;b&gt;categories&lt;/b&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=28;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;fillColor=#E8F5E9;strokeColor=#388E3C;fontColor=#1B5E20;" vertex="1" parent="1">
      <mxGeometry x="460" y="100" width="310" height="210" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_cat_1" value="PK | id : INT (AUTO_INCREMENT)" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;overflow=hidden;rotatable=0;fontStyle=1;fontColor=#B71C1C;" vertex="1" parent="ent_categories">
      <mxGeometry y="28" width="310" height="26" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_cat_div1" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;" vertex="1" parent="ent_categories">
      <mxGeometry y="54" width="310" height="6" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_cat_fields" value="   name : VARCHAR(100) NOT NULL (Nama Kategori)&#xa;   description : TEXT NULL (Deskripsi Makanan)&#xa;   created_at : TIMESTAMP DEFAULT CURRENT_TIMESTAMP&#xa;   updated_at : TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;" vertex="1" parent="ent_categories">
      <mxGeometry y="60" width="310" height="150" as="geometry" />
    </mxCell>`,

    // Entity 3: products
    `<mxCell id="ent_products" value="&lt;b&gt;products&lt;/b&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=28;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;fillColor=#FFF3E0;strokeColor=#F57C00;fontColor=#E65100;" vertex="1" parent="1">
      <mxGeometry x="880" y="100" width="360" height="280" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_prod_1" value="PK | id : INT (AUTO_INCREMENT)" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;overflow=hidden;rotatable=0;fontStyle=1;fontColor=#B71C1C;" vertex="1" parent="ent_products">
      <mxGeometry y="28" width="360" height="26" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_prod_div1" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;" vertex="1" parent="ent_products">
      <mxGeometry y="54" width="360" height="6" as="geometry" />
    </mxCell>`,
    `<mxCell id="f_prod_fields" value="FK | category_id : INT NOT NULL (Ref: categories.id)&#xa;   name : VARCHAR(150) NOT NULL (Nama Menu)&#xa;   description : TEXT NULL (Penjelasan Menu)&#xa;   price : DECIMAL(12,2) DEFAULT 0.00 (Harga Jual)&#xa;&lt;b style=&quot;color: #D84315;&quot;&gt;   stock : INT DEFAULT 0 (Stok Porsi Berkurang Otomatis)&lt;/b&gt;&#xa;   image_url : VARCHAR(255) NULL (Nama File Foto Menu)&#xa;   created_at : TIMESTAMP DEFAULT CURRENT_TIMESTAMP&#xa;   updated_at : TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;overflow=hidden;rotatable=0;html=1;" vertex="1" parent="ent_products">
      <mxGeometry y="60" width="360" height="220" as="geometry" />
    </mxCell>`,

    // Relationship Crow's foot between categories and products (1 to Many)
    `<mxCell id="rel_cat_prod_erd" value="1          0..*&#xa;menaungi (CASCADE)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;strokeWidth=2;strokeColor=#D84315;exitX=1;exitY=0.4;exitDx=0;exitDy=0;entryX=0;entryY=0.35;entryDx=0;entryDy=0;" edge="1" parent="1" source="ent_categories" target="ent_products">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>`,

    // Annotation Box / Cardinality Explanation
    `<mxCell id="erd_note" value="&lt;b&gt;💡 CONTEKAN TEKNIS DATABASE UNTUK UJI LEVEL:&lt;/b&gt;&lt;br&gt;&lt;br&gt;1. &lt;b&gt;Mengapa Cukup 3 Tabel Utama?&lt;/b&gt;&lt;br&gt;Sistem UMKM Dapoer Berkah dirancang ramping dan cepat: tabel &lt;b&gt;users&lt;/b&gt; mencatat hak akses (Admin, Kasir, Pelanggan), &lt;b&gt;categories&lt;/b&gt; mengelompokkan makanan, dan &lt;b&gt;products&lt;/b&gt; menyimpan menu beserta sisa stok.&lt;br&gt;&lt;br&gt;2. &lt;b&gt;Bagaimana Cara Stok Berkurang Otomatis Saat Pelanggan Beli?&lt;/b&gt;&lt;br&gt;Ketika Pelanggan menekan tombol 'Beli', backend menjalankan perintah SQL:&lt;br&gt;&lt;code style=&quot;color: #D84315; font-weight: bold;&quot;&gt;UPDATE products SET stock = stock - ? WHERE id = ?&lt;/code&gt;&lt;br&gt;Sehingga jika stok awal 10 dan dibeli 2 porsi, stok di database langsung berubah menjadi 8 secara otomatis.&lt;br&gt;&lt;br&gt;3. &lt;b&gt;Relasi Tabel (1 : N):&lt;/b&gt;&lt;br&gt;Satu kategori (misal: 'Makanan Utama') bisa memiliki banyak item menu kuliner (Nasi Goreng, Ayam Bakar, dll).&lt;br&gt;&lt;br&gt;4. &lt;b&gt;Keamanan Akun:&lt;/b&gt;&lt;br&gt;Password pengguna tidak disimpan sebagai teks biasa, melainkan dienkripsi satu arah menggunakan &lt;b&gt;Bcrypt (10 salt rounds)&lt;/b&gt; demi keamanan data." style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#FFFDE7;strokeColor=#FBC02D;fontColor=#37474F;align=left;verticalAlign=top;spacingLeft=14;spacingTop=10;spacingRight=10;" vertex="1" parent="1">
      <mxGeometry x="120" y="420" width="1050" height="230" as="geometry" />
    </mxCell>`
  ];

  return `  <diagram id="diagram_erd" name="4. ERD Database">
    <mxGraphModel dx="1350" dy="850" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1300" pageHeight="720" background="#FFFFFF" math="0" shadow="0">
      <root>
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>`;
}

// ====================================================
// BUILD MASTER & INDIVIDUAL DRAWIO FILES
// ====================================================
function main() {
  const masterXml = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Mozilla/5.0" version="21.0.0" type="device">
${getUseCaseDiagram()}
${getActivityDiagram()}
${getClassDiagram()}
${getErdDiagram()}
</mxfile>`;

  const outMasterPath = path.join(__dirname, 'DIAGRAM_DAN_ERD_DAPOER_BERKAH.drawio');
  fs.writeFileSync(outMasterPath, masterXml, 'utf8');
  console.log(`[SUCCESS] Master draw.io file updated: ${outMasterPath}`);

  // Folder individual
  const drawioDir = path.join(__dirname, 'drawio');
  if (!fs.existsSync(drawioDir)) {
    fs.mkdirSync(drawioDir);
  }

  // 1. Use case
  const ucXml = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Mozilla/5.0" version="21.0.0" type="device">\n${getUseCaseDiagram()}\n</mxfile>`;
  fs.writeFileSync(path.join(drawioDir, '1_Use_Case_Diagram.drawio'), ucXml, 'utf8');

  // 2. Activity
  const actXml = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Mozilla/5.0" version="21.0.0" type="device">\n${getActivityDiagram()}\n</mxfile>`;
  fs.writeFileSync(path.join(drawioDir, '2_Activity_Diagram.drawio'), actXml, 'utf8');

  // 3. Class
  const clsXml = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Mozilla/5.0" version="21.0.0" type="device">\n${getClassDiagram()}\n</mxfile>`;
  fs.writeFileSync(path.join(drawioDir, '3_Class_Diagram.drawio'), clsXml, 'utf8');

  // 4. ERD
  const erdXml = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Mozilla/5.0" version="21.0.0" type="device">\n${getErdDiagram()}\n</mxfile>`;
  fs.writeFileSync(path.join(drawioDir, '4_ERD_Database.drawio'), erdXml, 'utf8');

  console.log(`[SUCCESS] All 4 individual draw.io files updated in ${drawioDir}`);
}

main();
