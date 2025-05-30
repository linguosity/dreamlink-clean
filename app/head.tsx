// app/head.tsx
export default function Head() {
    return (
      <>
        {/* tell the browser to start fetching your bg image ASAP */}
        <link
          rel="preload"
          as="image"
          href="/images/background.jpg"
          fetchPriority="high"
        />
        {/* your normal meta tags */}
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </>
    );
  }