import React from 'react';
import useThemeStore from '../../store/themeStore';

const Privacy = () => {
  const { theme } = useThemeStore();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Main Title with adjusted spacing for nav bar */}
      <div className={`text-center pt-24 pb-8 relative transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-meta-gray-100/80'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-meta-blue/20 to-transparent" />
        <h1 className={`text-4xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>MetaAgency</h1>
      </div>

      {/* Privacy Policy Card */}
      <div className={`max-w-4xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-white border border-meta-gray-200'} rounded-lg shadow-lg p-8 mb-8`}>
        <h2 className={`text-3xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'} mb-6`}>Kebijakan Privasi Meta Agency</h2>
        
        <div className="prose prose-lg dark:prose-invert">
          <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'} mb-6`}>
            Kebijakan privasi Meta Agency untuk melindungi data dan informasi pengguna.
          </p>

          <div className={`bg-meta-blue/10 p-4 rounded-lg mb-6 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-blue/20' : 'bg-meta-blue/10'}`}>
            <p className={`text-sm transition-colors duration-500 ${theme === 'dark' ? 'text-meta-blue/90' : 'text-meta-blue'}`}>
              <strong>Terakhir diperbarui:</strong> 2 Juni 2025
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className={`text-xl font-semibold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'} mb-3`}>Selamat Datang</h3>
              <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                Kebijakan Privasi ini berlaku untuk layanan Meta Agency, yang mencakup aplikasi, situs web, perangkat lunak, dan layanan terkait. Platform ini disediakan dan dikendalikan oleh Meta Agency.
              </p>
              <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'} mt-2`}>
                Kami berkomitmen untuk melindungi dan menghormati privasi Anda. Kebijakan Privasi ini menjelaskan cara kami mengumpulkan, menggunakan, membagikan, dan memproses informasi pribadi pengguna, dan individu lain.
              </p>
            </section>

            <section>
              <h3 className={`text-xl font-semibold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'} mb-3`}>Informasi yang Kami Kumpulkan</h3>
              <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'} mb-4`}>Kami dapat mengumpulkan informasi berikut tentang Anda:</p>
              
              <div className="space-y-4">
                <div className={`transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-meta-gray-100/80'} p-4 rounded-lg`}>
                  <h4 className={`font-semibold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'} mb-2`}>Informasi Akun</h4>
                  <ul className={`list-disc list-inside space-y-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                    <li>Nama pengguna</li>
                    <li>Kata sandi</li>
                    <li>Tanggal lahir (apabila berlaku)</li>
                    <li>Alamat email dan/atau nomor telepon</li>
                    <li>Informasi profil pengguna</li>
                    <li>Foto atau video profil</li>
                  </ul>
                </div>

                <div className={`transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-meta-gray-100/80'} p-4 rounded-lg`}>
                  <h4 className={`font-semibold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'} mb-2`}>Konten Pengguna</h4>
                  <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                    Kami memproses konten yang Anda buat di Platform, termasuk:
                  </p>
                  <ul className={`list-disc list-inside space-y-2 mt-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                    <li>Foto, audio, dan video yang diunggah</li>
                    <li>Komentar dan tagar</li>
                    <li>Ulasan dan masukan</li>
                    <li>Streaming langsung</li>
                    <li>Metadata terkait (waktu, tempat, pihak terkait)</li>
                  </ul>
                </div>

                <div className={`transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-meta-gray-100/80'} p-4 rounded-lg`}>
                  <h4 className={`font-semibold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'} mb-2`}>Informasi Pembelian</h4>
                  <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                    Saat melakukan pembelian atau pembayaran, kami mengumpulkan:
                  </p>
                  <ul className={`list-disc list-inside space-y-2 mt-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                    <li>Informasi kartu pembayaran</li>
                    <li>Informasi penagihan dan pengiriman</li>
                    <li>Informasi kontak</li>
                    <li>Detail item yang dibeli</li>
                  </ul>
                </div>
              </div>
            </section>

            <div className={`bg-yellow-50 p-4 rounded-lg transition-colors duration-500 ${theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-800/50' : 'border border-yellow-200'}`}>
              <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
                <strong>Catatan Penting:</strong> Jika Anda tidak setuju dengan kebijakan ini, Anda sebaiknya tidak menggunakan Platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 