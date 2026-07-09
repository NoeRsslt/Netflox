import { ChangeEvent, useState } from "react";
import "./Header.css";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <header className="header">
      <div className="header__logo">
        NETFLO<span>X</span>
      </div>
      <input
        type="text"
        className="header__search"
        placeholder="Rechercher un film..."
        value={query}
        onChange={handleChange}
      />
    </header>
  );
}
