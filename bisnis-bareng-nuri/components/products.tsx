"use client";
import { useMemo, useState } from "react";
import {
  IconArrowUpRight,
  IconArrowRight,
  IconSearch,
  IconX,
  IconAdjustmentsHorizontal,
  IconHeart,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import type { Product } from "../lib/types";
import { filterProducts } from "../lib/utils";
import { ChatButton, ExternalButton, PhotoView } from "./ui";
export function ProductCard({
  product: p,
  type = "shopee",
}: {
  product: Product;
  type?: "shopee" | "oriflame";
}) {
  return (
    <article className={`product-card ${type}`}>
      <PhotoView photo={p.image} />
      <div className="product-meta">
        <span>{p.category}</span>
        {p.featured && (
          <span className="favorite">
            <IconHeart size={14} />
            Pilihan Nuri
          </span>
        )}
      </div>
      <h3>{p.name}</h3>
      <p>{p.recommendationNote}</p>
      {p.displayPrice && (
        <p className="price">
          {p.displayPrice}
          <small>Harga terbaru di toko tujuan</small>
        </p>
      )}
      <div className="product-actions">
        {type === "oriflame" ? (
          <>
            <ChatButton className="text-link" kind="produk" product={p.name}>
              <IconBrandWhatsapp size={17} />
              Tanya produk
            </ChatButton>
            <ExternalButton url={p.destinationUrl} hosts={["oriflame.com"]}>
              <span className="sr-only">{p.name}: </span>Belanja{" "}
              <IconArrowUpRight size={16} />
            </ExternalButton>
          </>
        ) : (
          <ExternalButton
            url={p.destinationUrl}
            hosts={["shopee.co.id", "shope.ee", "s.shopee.co.id"]}
            affiliate={p.affiliate}
          >
            Lihat di Shopee <IconArrowUpRight size={16} />
            <span className="sr-only">: {p.name}</span>
          </ExternalButton>
        )}
      </div>
      {p.affiliate && <span className="affiliate-label">Tautan afiliasi</span>}
    </article>
  );
}
export function ProductBrowser({
  products,
  type = "shopee",
}: {
  products: Product[];
  type?: "shopee" | "oriflame";
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("curated");
  const categories = [
    "Semua",
    ...new Set(products.filter((p) => p.visible).map((p) => p.category)),
  ];
  const filtered = useMemo(() => {
    const items = filterProducts(products, query, category);
    return sort === "name"
      ? items.sort((a, b) => a.name.localeCompare(b.name, "id"))
      : items;
  }, [products, query, category, sort]);
  function reset() {
    setQuery("");
    setCategory("Semua");
  }
  return (
    <div className="product-browser">
      <h2 className="sr-only">Daftar pilihan produk</h2>
      <div className="browse-toolbar">
        <div className="search-field">
          <IconSearch size={20} />
          <label className="sr-only" htmlFor="product-search">
            Cari nama atau catatan produk
          </label>
          <input
            id="product-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pilihan yang kamu butuhkan..."
          />
          {query && (
            <button
              className="icon-button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
            >
              <IconX size={18} />
            </button>
          )}
        </div>
        <label className="sort-field">
          <IconAdjustmentsHorizontal size={19} />
          <span className="sr-only">Urutkan produk</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="curated">Pilihan Nuri</option>
            <option value="name">Nama A–Z</option>
          </select>
        </label>
      </div>
      <div className="filter-row" aria-label="Kategori produk">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "filter active" : "filter"}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="result-count" role="status" aria-live="polite">
        {filtered.length} pilihan
        {category !== "Semua" ? ` dalam ${category}` : ""}
        {query ? ` untuk “${query}”` : ""}
      </p>
      {filtered.length ? (
        <div className="products-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} type={type} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <IconSearch size={32} />
          <h2>Belum ketemu yang cocok?</h2>
          <p>Coba kata yang lebih singkat atau jelajahi kategori lainnya.</p>
          <button className="button secondary" onClick={reset}>
            Hapus filter <IconArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
