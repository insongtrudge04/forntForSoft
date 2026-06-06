'use client';

export function SortSelect({ sort }: { sort: string }) {
  return (
    <select
      name="sort"
      defaultValue={sort}
      onChange={(e) => e.target.form?.submit()}
      className="input"
      style={{ width: 'auto', padding: '0.5rem 1rem' }}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="most_saved">Most Saved</option>
    </select>
  );
}
