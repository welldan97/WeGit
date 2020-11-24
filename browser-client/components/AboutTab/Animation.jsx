// Imports
// =============================================================================

import { readFileSync } from 'fs';

import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';

const logoSrc = readFileSync(__dirname + '/logo.txt', 'utf-8');
const fontSrc = readFileSync(__dirname + '/font.txt', 'utf-8');

// Utils
// =============================================================================

const font = new Image(); // Create new img element
font.src = fontSrc;

const lyrics = [
  {
    phrase: "instead of fire - there's only smoke",
    time: 34.5,
  },
  {
    phrase: 'instead of warmth - cold',
    time: 4,
  },
  {
    phrase: 'another day is crossed out on the calendar grid',
    time: 3.5,
  },
  {
    phrase: 'the red shining sun has completely burned out,',
    time: 7,
  },
  {
    phrase: 'and this day goes out with it,',
    time: 4,
  },
  {
    phrase: 'and over a glowing city, the shadow will fall',
    time: 4,
  },
  {
    phrase: 'we want changes',
    time: 6.5,
  },
  {
    phrase: "it's the demand of our hearts",
    time: 2.5,
  },
  {
    phrase: 'we want changes',
    time: 5,
  },
  {
    phrase: "it's the demand of our eyes",
    time: 2,
  },
  {
    phrase: 'when we laugh, when we cry, when we feel the pulse in our veins',
    time: 5.5,
  },
  {
    phrase: 'we want changes',
    time: 7,
  },
  {
    phrase: "we're waiting for changes",
    time: 3,
  },
  {
    phrase: 'bright electric light continues our day,',
    time: 16.1,
  },
  {
    phrase: "we don't have matches but instead of them",
    time: 4,
  },
  {
    phrase: 'on the kitchen, like a blue flower, there is gas',
    time: 3.5,
  },
  {
    phrase: 'there are some cigarettes and tea on the table,',
    time: 7,
  },
  {
    phrase: 'this is the simplest routine',
    time: 4,
  },
  {
    phrase: "and there's nothing more left, everything's up to us",
    time: 3.5,
  },
  {
    phrase: 'we want changes',
    time: 7,
  },
  {
    phrase: "it's the demand of our hearts",
    time: 2.5,
  },
  {
    phrase: 'we want changes',
    time: 5,
  },
  {
    phrase: "it's the demand of our eyes",
    time: 2,
  },
  {
    phrase: 'when we laugh, when we cry, when we feel the pulse in our veins',
    time: 5.5,
  },
  {
    phrase: 'we want changes',
    time: 7,
  },
  {
    phrase: "we're waiting for changes",
    time: 3,
  },

  {
    phrase: 'we cannot brag about the wisdom of our eyes,',
    time: 16.1,
  },
  {
    phrase: 'and our gestures are not very skilled,',
    time: 4,
  },
  {
    phrase: 'but even without it all, we understand everything',
    time: 3.5,
  },
  {
    phrase: 'there is some cigarettes and tea on the table,',
    time: 7,
  },
  {
    phrase: "that's how the circle is filled,",
    time: 4,
  },
  {
    phrase: 'and suddenly we become scared to change something',
    time: 3.5,
  },
  {
    phrase: 'we want changes',
    time: 7,
  },
  {
    phrase: "it's the demand of our hearts",
    time: 2.5,
  },

  {
    phrase: 'we want changes',
    time: 5,
  },
  {
    phrase: "it's the demand of our eyes",
    time: 2,
  },
  {
    phrase: 'when we laugh, when we cry, when we feel the pulse in our veins',
    time: 5.5,
  },
  {
    phrase: 'we want changes',
    time: 7,
  },
  {
    phrase: "we're waiting for changes",
    time: 3,
  },

  {
    phrase: 'we want changes',
    time: 4.5,
  },
  {
    phrase: "it's the demand of our hearts",
    time: 2.5,
  },
  {
    phrase: 'we want changes',
    time: 5,
  },
  {
    phrase: "it's the demand of our eyes",
    time: 2,
  },
  {
    phrase: 'when we laugh, when we cry, when we feel the pulse in our veins',
    time: 5.5,
  },
  {
    phrase: 'we want changes',
    time: 7,
  },
  {
    phrase: 'and changes will begin',
    time: 3,
  },
];

const width = 700;
const height = 400;
const delay = 0;
const splitChance = 0.994;
const connectChance = 0.9994;
let maxPeers = 20;
const maxMaxPeers = 50;
const velocity = 2;
const size = 20;
const maxZ = 0 && 0.5;
/*
const drawPixel = (ctx, x, y, color = 'white') => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x * 2), Math.round(y * 2), 2, 2);
};
*/
const drawSpace = (ctx, peers) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, width, height);
  peers.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.w * p.z, 0, 2 * Math.PI);
    ctx.fillStyle = p.partner
      ? `hsla(60deg, 100%, 50%, 1)`
      : `hsla(${Math.round(
          (p.colAng / Math.PI / 2) * 360,
        )}deg, 100%, 75%, 0.5)`;
    ctx.fill();

    /*
    drawPixel(
      ctx,
      p.x,
      p.y,
      //  p.col,
      `hsl(${Math.round((p.colAng / Math.PI / 2) * 360)}deg 100% 75%)`,
    );*/
  });
};

const proccessPeers = peers => {
  return peers.reduce((acc, p) => {
    let x, y;

    x = p.x + Math.cos(p.ang) * p.v * p.z;
    y = p.y + Math.sin(p.ang) * p.v * p.z;

    if (x < 0) return acc;
    if (x > width) return acc;
    if (y < 0) return acc;
    if (y > height) return acc;
    if (p.die) return acc;

    if (Math.random() > splitChance && !p.partner) {
      const ang = Math.PI / 3;

      return [
        ...acc,
        {
          ...p,
          x,
          y,
          w: p.w * 0.85,
          v: p.v / 0.85,
          ang: p.ang + ang,
          colAng: p.colAng + ang,
        },
        {
          ...p,
          x,
          y,
          w: p.w * 0.85,
          v: p.v / 0.85,

          ang: p.ang - ang,
          colAng: p.colAng - ang,
        },
      ];
    }

    if (Math.random() > connectChance && !p.partner) {
      const peers = acc.filter(a => !a.partner && a.w === p.w);
      const partner = peers[Math.floor(Math.random() * peers.length)];
      if (partner) {
        partner.partner = p.id;

        const ang = Math.atan2(p.y - partner.y, p.x - partner.x);
        partner.ang = ang;
        partner.v = partner.v * 2;
        return [
          ...acc,
          {
            ...p,
            v: p.v * 2,
            //ang: p.ang + Math.PI / 100,
            ang: Math.PI + ang,
            colAng: p.colAng + Math.PI / 50,
            x,
            y,
            partner: partner.id,
          },
        ];
      }
    }
    const curPartner = peers.find(a => a.id === p.partner);
    if (curPartner) {
      const len = Math.sqrt(
        (p.x - curPartner.x) * (p.x - curPartner.x) +
          (p.y - curPartner.y) * (p.y - curPartner.y),
      );
      if (len < /*p.v + curPartner.v*/ size) {
        if (maxPeers < maxMaxPeers) maxPeers = maxPeers + 1;
        p.die = true;
        curPartner.die = true;
      }
      if (curPartner.die) p.die = true;
      p.colAng = p.colAng + Math.PI / 50;
      p.x = x;
      p.y = y;
      p.z = (curPartner.z + p.z) / 2;
      return [...acc, p];
    } else {
      p.ang = p.partner ? p.ang : p.ang + Math.PI / 100;
      p.colAng = p.colAng + Math.PI / 50;
      p.x = x;
      p.y = y;
      return [...acc, p];
      /*return [
        ...acc,
        {
          ...p,
          ang: p.partner ? p.ang : p.ang + Math.PI / 100,
          colAng: p.colAng + Math.PI / 50,
          x,
          y,
        },
      ];*/
    }
  }, []);
};

const createPeer = () => {
  const peer = {
    id: Math.random(),
    colAng: Math.round(Math.random() * Math.PI * 2),
    v: velocity,
    w: size,
    z: Math.random() * maxZ + 1 - maxZ,
  };
  const sideRand = Math.random();

  if (sideRand < 0.25) {
    peer.x = 0;
    peer.y = Math.random() * height;

    peer.ang = Math.random() * Math.PI - Math.PI / 2;
  } else if (sideRand < 0.5) {
    peer.x = width;
    peer.y = Math.random() * height;

    peer.ang = Math.random() * Math.PI + Math.PI / 2;
  } else if (sideRand < 0.75) {
    peer.x = Math.random() * width;
    peer.y = 0;

    peer.ang = Math.random() * Math.PI;
  } else {
    peer.x = Math.random() * width;
    peer.y = height;

    peer.ang = Math.random() * Math.PI - Math.PI;
  }

  return peer;
};

const charW = 16;
const scale = 1;
const charSpeed = 5;
const drawChar = (ctx, letter, x, y) => {
  if (letter === ' ') return;
  let code = 32 + letter.charCodeAt() - 97;

  if (letter === ',') code = 11;
  if (letter === '-') code = 12;
  if (letter === "'") code = 6;

  let w = charW;
  let h = 15;
  let offset = (w + 1) * code + 1;

  ctx.beginPath();
  ctx.fillStyle = 'rgba(0,0,00,1)';
  /*
  ctx.fillRect(
    x - (w / 2) * scale - 1,
    y - (h / 2) * scale - 1,
    w * scale + 2,
    h * scale + 2,
  );*/
  ctx.arc(x, y, charW * 0.9 * scale, 0, 2 * Math.PI);
  ctx.fill();

  ctx.drawImage(
    font,
    offset,
    1,
    w - 0.1,
    h,
    x - (w / 2) * scale,
    y - (h / 2) * scale,
    w * scale,
    h * scale,
  );
};

const drawText = (ctx, chars) => {
  chars.forEach(c => {
    drawChar(ctx, c.char, c.x, c.y);
  });
};

const proccessChars = (chars, { time: t, nextTime: nextT }) => {
  let nextChars = [];
  lyrics.reduce((time, l) => {
    if (l.time + time < nextT && l.time + time >= t) {
      nextChars.push(
        ...l.phrase.split('').map((c, i) => ({
          char: c,
          x: 700 + i * (charW * 1.5 * scale),
        })),
      );
    }

    return l.time + time;
  }, 0);
  t = nextT;
  return [
    ...chars.reduce((acc, c) => {
      if (c.x < -30) return acc;
      return [
        ...acc,
        {
          ...c,
          x: c.x - charSpeed,
          y: 300 - Math.cos((c.x / width) * 2 * Math.PI) * 30,
        },
      ];
    }, []),
    ...nextChars,
  ];
};
// Main
// =============================================================================

export default function Logo() {
  const ref = useRef();
  const ctxRef = useRef();

  useEffect(
    () => {
      if (!ref.current) return;
      ref.current.getContext('2d');
      ctxRef.current = ref.current.getContext('2d');
    },
    [
      /*ref.current*/
    ],
  );
  const playerRef = useRef();

  useEffect(() => {
    let running = true;

    let peers = [];
    let chars = [];

    const draw = async (prevTime, time) => {
      //if (!playerRef.current?.internalPlayer) return;
      const nextTime =
        (await playerRef.current?.internalPlayer.getCurrentTime()) ?? 0;
      if (!ctxRef.current) return;
      if (!running) return;
      const ctx = ctxRef.current;

      if (peers.length < maxPeers) peers.push(createPeer());

      drawSpace(ctx, peers);
      drawText(ctx, chars);
      peers = proccessPeers(peers);
      chars = proccessChars(chars, { time, nextTime });
      window.requestAnimationFrame(() => {
        setTimeout(() => draw(time, nextTime), delay);
      });
    };
    draw(0, 0);
    return () => (running = false);
  }, [
    playerRef.current?.internalPlayer,
    /*ctxRef.current*/
  ]);

  const opts = {
    height: '120',
    width: '160',
    playerVars: {
      autoplay: 1,
      start: 25,
    },
  };
  return (
    <>
      <img
        src={logoSrc}
        style={{
          position: 'absolute',
          width: '60%',
          mixBlendMode: 'difference',
          left: '20%',
          top: '35px',
        }}
      />
      <canvas
        width={width}
        height={height}
        style={{ border: '2px solid white', background: 'black' }}
        ref={ref}
      ></canvas>
      <div
        style={{
          position: 'absolute',
          right: '-400px',
          top: '-60px',
          opacity: '0.5',
        }}
      >
        {<YouTube videoId="ntklTGMzL28" opts={opts} ref={playerRef} />}
      </div>
    </>
  );
}
