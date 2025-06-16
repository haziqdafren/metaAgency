import React from 'react';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const Terms = () => {
  const { theme } = useThemeStore();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Main Title with decorative elements */}
      <div className={`text-center pt-24 pb-12 relative transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-meta-gray-100/80'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-meta-blue/20 to-transparent" />
        <h1 className={`text-4xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
          MetaAgency
        </h1>
        <div className="mt-2 h-1 w-24 bg-gradient-to-r from-meta-blue to-cyan-500 mx-auto rounded-full" />
      </div>

      {/* Terms Card with different styling */}
      <div className={`max-w-4xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-white border border-meta-gray-200'} rounded-2xl shadow-xl p-8 mb-8`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-meta-blue to-cyan-500 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-3xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Syarat & Ketentuan</h2>
        </div>
        
        <div className="prose prose-lg dark:prose-invert">
          <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'} mb-8 leading-relaxed`}>
            Untuk menjadi agensi TikTok, Anda perlu memenuhi persyaratan dasar seperti memiliki akun bisnis yang terdaftar, memiliki portofolio konten yang relevan, dan memiliki tim yang berkualifikasi.
          </p>

          <div className={`bg-gradient-to-r from-meta-blue/10 to-cyan-500/10 p-6 rounded-xl mb-8 border border-meta-blue/20 transition-colors duration-500 ${theme === 'dark' ? 'border-meta-blue/30' : 'border-meta-blue/20'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-meta-blue flex-shrink-0 mt-1" />
              <p className="text-meta-blue">
                <strong>Catatan Penting:</strong> Pastikan Anda memenuhi semua persyaratan yang ditetapkan sebelum mendaftar untuk menghindari penolakan aplikasi.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <section className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-meta-blue to-cyan-500 rounded-full" />
              <div className="pl-6">
                <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                  <span className="h-8 w-8 rounded-full bg-meta-blue/10 flex items-center justify-center text-meta-blue">1</span>
                  Persyaratan Umum
                </h3>
                <div className={`transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-white border border-meta-gray-200'} p-6 rounded-xl shadow-sm`}>
                  <ul className="space-y-3">
                    {[
                      'Akun TikTok Bisnis yang terdaftar',
                      'Portofolio konten yang relevan dan berkualitas',
                      'Tim yang kompeten dan berpengalaman',
                      'Penguasaan platform TikTok Ads',
                      'Kemampuan dalam manajemen bisnis',
                      'Usia minimal 18 tahun (19 tahun di Korea Selatan)',
                      'Akun TikTok berusia minimal 30 hari',
                      'Akun publik (pribadi atau bisnis)'
                    ].map((item, index) => (
                      <li key={index} className={`flex items-start gap-3 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                        <CheckCircle className="h-5 w-5 text-meta-blue flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-meta-blue to-cyan-500 rounded-full" />
              <div className="pl-6">
                <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                  <span className="h-8 w-8 rounded-full bg-meta-blue/10 flex items-center justify-center text-meta-blue">2</span>
                  Langkah-langkah Pendaftaran
                </h3>
                <div className={`transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-white border border-meta-gray-200'} p-6 rounded-xl shadow-sm`}>
                  <ol className="space-y-4">
                    {[
                      'Siapkan semua persyaratan yang ditetapkan oleh TikTok',
                      'Buat akun TikTok Bisnis (jika belum memiliki)',
                      'Pelajari dan pahami platform TikTok Ads',
                      'Hubungi TikTok melalui pusat bantuan atau sumber resmi',
                      'Ikuti proses verifikasi dan pendaftaran'
                    ].map((item, index) => (
                      <li key={index} className={`flex items-start gap-3 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                        <span className="h-6 w-6 rounded-full bg-meta-blue/10 flex items-center justify-center text-meta-blue text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-meta-blue to-cyan-500 rounded-full" />
              <div className="pl-6">
                <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                  <span className="h-8 w-8 rounded-full bg-meta-blue/10 flex items-center justify-center text-meta-blue">3</span>
                  Informasi Tambahan
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-white border border-meta-gray-200'} p-6 rounded-xl shadow-sm`}>
                    <h4 className={`font-semibold mb-3 flex items-center gap-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                      <ArrowRight className="h-5 w-5 text-meta-blue" />
                      Spesialisasi
                    </h4>
                    <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                      Memutuskan niche atau fokus spesifik (misalnya, mode, musik, kuliner) dapat membantu agensi membangun reputasi yang kuat.
                    </p>
                  </div>

                  <div className={`transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-white border border-meta-gray-200'} p-6 rounded-xl shadow-sm`}>
                    <h4 className={`font-semibold mb-3 flex items-center gap-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                      <ArrowRight className="h-5 w-5 text-meta-blue" />
                      Pemasaran
                    </h4>
                    <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
                      Membangun jaringan dan menjalin hubungan dengan klien potensial juga penting untuk pertumbuhan agensi.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <div className={`bg-yellow-50 p-4 rounded-lg transition-colors duration-500 ${theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-800/50' : 'border border-yellow-200'}`}>
              <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
              <strong>Pengecualian:</strong> Akun politik dan pribadi tidak memenuhi syarat untuk menjadi agensi. Pastikan untuk memeriksa kategori akun Anda sebelum mendaftar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;