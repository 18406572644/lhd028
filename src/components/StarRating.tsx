interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}

export default function StarRating({ value, onChange, size = 20, readOnly = false }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onChange?.(star)}
          className={`transition-colors duration-150 ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          style={{ fontSize: size }}
        >
          {star <= Math.floor(value) ? (
            <span className="text-retro-gold">★</span>
          ) : star - 0.5 <= value ? (
            <span className="text-retro-gold-dark">★</span>
          ) : (
            <span className="text-retro-brown-light">☆</span>
          )}
        </span>
      ))}
    </div>
  );
}
