import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#0b0d10",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 48%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "40px",
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
            height: "96px",
            left: "34px",
            opacity: 0.95,
            position: "absolute",
            top: "42px",
            width: "10px",
          }}
        />
        <svg
          fill="none"
          viewBox="0 0 24 24"
          width="82"
          height="82"
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
