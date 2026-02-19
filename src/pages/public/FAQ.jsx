import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: 'Bergabung',
    items: [
      {
        q: 'Apa syarat untuk bergabung dengan Meta Agency?',
        a: 'Kami menerima creator TikTok aktif yang sudah memiliki akun LIVE aktif. Tidak ada syarat minimum followers—yang terpenting adalah konsistensi dan komitmen untuk LIVE secara rutin. Isi formulir di halaman Join untuk memulai proses pendaftaran.',
      },
      {
        q: 'Apakah ada biaya pendaftaran?',
        a: 'Tidak ada biaya pendaftaran. Meta Agency beroperasi dengan sistem bagi hasil dari bonus yang diperoleh creator. Tidak ada biaya awal yang perlu dibayarkan.',
      },
      {
        q: 'Berapa lama proses seleksi setelah mendaftar?',
        a: 'Tim kami akan menghubungi Anda melalui WhatsApp dalam 1–3 hari kerja setelah formulir diterima. Proses onboarding biasanya selesai dalam satu minggu.',
      },
    ],
  },
  {
    category: 'Sistem Bonus',
    items: [
      {
        q: 'Bagaimana sistem bonus di Meta Agency bekerja?',
        a: 'Bonus dihitung berdasarkan performa LIVE bulanan setiap creator. Ada tiga grade: Grade A (22+ hari LIVE, 100+ jam), Grade B (20+ hari, 60+ jam), dan Grade C (15+ hari, 40+ jam). Setiap grade mendapat persentase bonus berbeda yang dihitung dari total diamonds yang diperoleh.',
      },
      {
        q: 'Kapan bonus dibayarkan setiap bulannya?',
        a: 'Bonus dihitung dan dikonfirmasi pada minggu pertama bulan berikutnya setelah data performa dikompilasi. Pembayaran dilakukan selambatnya pada tanggal 15 bulan berjalan.',
      },
      {
        q: 'Apakah ada minimum diamonds untuk mendapatkan bonus?',
        a: 'Tidak ada minimum diamonds. Namun, untuk masuk ke sistem grading, creator perlu memenuhi persyaratan hari LIVE aktif dan jam LIVE minimum. Creator yang tidak memenuhi syarat grade tetap mendapat bagian diamonds standar sesuai perjanjian.',
      },
      {
        q: 'Bagaimana cara menghitung estimasi bonus saya?',
        a: 'Anda bisa menggunakan kalkulator bonus di halaman Info Bonus. Masukkan total diamonds, valid live days, dan total jam LIVE Anda untuk mendapatkan estimasi. Hasil akhir mungkin sedikit berbeda karena kurs dan penyesuaian bulanan.',
      },
    ],
  },
  {
    category: 'Dukungan & Manajemen',
    items: [
      {
        q: 'Dukungan apa saja yang diberikan Meta Agency kepada creator?',
        a: 'Kami menyediakan: manajemen akun dan koordinasi dengan TikTok, edukasi strategi LIVE dan peningkatan engagement, fasilitasi endorsement dengan brand, analitik performa bulanan, dan support teknis untuk masalah akun.',
      },
      {
        q: 'Apakah saya masih bisa menerima endorsement dari brand lain?',
        a: 'Ya. Meta Agency membantu memfasilitasi peluang endorsement, namun creator tetap bebas menerima tawaran langsung dari brand. Kami hanya meminta transparansi jika endorsement berpotensi konflik kepentingan dengan brand yang sudah kami koordinasikan.',
      },
      {
        q: 'Bagaimana jika akun TikTok saya terkena masalah atau pembatasan?',
        a: 'Tim kami akan membantu proses eskalasi ke TikTok Creator Network. Kami memiliki jalur komunikasi langsung dengan pihak TikTok untuk membantu menyelesaikan masalah akun creator yang terdaftar.',
      },
    ],
  },
  {
    category: 'Kontrak & Ketentuan',
    items: [
      {
        q: 'Apakah ada kontrak yang harus ditandatangani?',
        a: 'Ya, ada perjanjian kerjasama yang bersifat non-eksklusif. Kontrak mencakup detail sistem bonus, hak dan kewajiban kedua pihak, serta durasi kerjasama awal (biasanya 3–6 bulan, dapat diperpanjang).',
      },
      {
        q: 'Bagaimana cara mengakhiri kerjasama dengan Meta Agency?',
        a: 'Creator dapat mengakhiri kerjasama dengan memberikan notifikasi 30 hari sebelumnya. Semua bonus yang sudah dihitung dan jatuh tempo akan tetap dibayarkan. Tidak ada denda atau biaya keluar.',
      },
    ],
  },
];

const FAQItem = ({ q, a, theme }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border-b last:border-b-0 transition-colors ${
        theme === 'dark' ? 'border-meta-gray-700' : 'border-gray-200'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-4 text-left gap-4 group"
      >
        <span className={`text-sm font-medium leading-relaxed ${
          theme === 'dark' ? 'text-white' : 'text-meta-black'
        }`}>
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-transform duration-300 text-meta-gray-500 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className={`pb-4 text-sm leading-relaxed ${
              theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'
            }`}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const { theme } = useThemeStore();

  return (
    <div className={`min-h-screen pt-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-meta-black text-white' : 'bg-white text-meta-black'
    }`}>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h1 className={`text-3xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
            Pertanyaan Umum
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
            Jawaban atas pertanyaan yang paling sering kami terima dari calon creator dan talent aktif.
          </p>
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {faqs.map((section, si) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: si * 0.08 }}
            >
              <h2 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${
                theme === 'dark' ? 'text-meta-blue' : 'text-meta-blue'
              }`}>
                {section.category}
              </h2>
              <div className={`rounded-xl border ${
                theme === 'dark'
                  ? 'bg-meta-gray-900 border-meta-gray-800'
                  : 'bg-white border-gray-200'
              } px-5`}>
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} theme={theme} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={`mt-14 p-6 rounded-xl border text-center ${
            theme === 'dark'
              ? 'bg-meta-gray-900 border-meta-gray-800'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <MessageCircle className="w-8 h-8 text-meta-blue mx-auto mb-3" />
          <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
            Masih ada pertanyaan?
          </h3>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
            Hubungi tim kami langsung — kami siap membantu.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-meta-blue text-meta-black text-sm font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Hubungi Kami
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
