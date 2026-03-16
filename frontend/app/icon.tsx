import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 48%), #0b0d10",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          color: "#f3f6f9",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#e5edf5",
            borderRadius: "999px",
            height: "34px",
            left: "12px",
            opacity: 0.95,
            position: "absolute",
            top: "15px",
            width: "4px",
          }}
        />
        <svg
          fill="none"
          viewBox="0 0 24 24"
          width="28"
          height="28"
        >
          <path
            d="M4 12.2h5.3l2.7-4.4 2.7 8.4 1.8-4h3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
