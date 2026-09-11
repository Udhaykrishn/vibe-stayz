"use client";
export default function SortSelect({ value }: { value: string }) {
  return (
    <select
      name="sort"
      id="sort"
      defaultValue={value}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    >
      <option value="recommended">Recommended</option>
      <option value="price-low">Price: low to high</option>
      <option value="price-high">Price: high to low</option>
    </select>
  );
}
