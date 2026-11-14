import { useEffect, useRef } from 'react';

export default function DustOverlay({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 28 + 10,
      vx: Math.random() * 9 + 6,
      vy: (Math.random() - 0.5) * 1.8,
      alpha: Math.random() * 0.35 + 0.08
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle warm atmospheric gradient
      const grad = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.5,
        50,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.7
      );
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.04)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.14)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Wind-streak vectors
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > canvas.width) p.x = -p.len;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len, p.y - p.vy * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${p.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[420] h-full w-full"
    />
  );
}
