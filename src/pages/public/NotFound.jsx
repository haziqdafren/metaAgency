import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="container-custom py-32 text-center">
    <h1 className="text-6xl font-black mb-4">404</h1>
    <p className="text-xl mb-8">Halaman tidak ditemukan.</p>
    <Link to="/" className="text-meta-blue underline">Kembali ke Beranda</Link>
  </section>
);

export default NotFound; 