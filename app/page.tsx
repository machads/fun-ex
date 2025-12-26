"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // index.htmlにリダイレクト
    window.location.href = "/index.html";
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>株式会社ファンエクス</h1>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    </div>
  );
}
