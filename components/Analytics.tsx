"use client";

import { useEffect, useRef } from "react";

export default function Analytics() {
    const hasLogged = useRef(false);

    useEffect(() => {
        if (hasLogged.current) return;
        hasLogged.current = true;

        const logVisit = async () => {
            const TG_BOT_TOKEN = process.env.NEXT_PUBLIC_TG_BOT_TOKEN;
            const TG_CHAT_ID = process.env.NEXT_PUBLIC_TG_CHAT_ID;

            if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;

            try {
                // Get IP Info
                let ipData = { ip: 'Unknown', country_name: 'Unknown', city: 'Unknown' };
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    ipData = await res.json();
                } catch (e) { }

                const message =
                    `<b>👀 New Site Visit</b>\n` +
                    `🌍 <b>Location:</b> ${ipData.city}, ${ipData.country_name} (${ipData.ip})\n` +
                    `📱 <b>Device:</b> ${navigator.userAgent}\n` +
                    `🔗 <b>Ref:</b> ${document.referrer || "Direct"}`;

                await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TG_CHAT_ID,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
            } catch (e) {
                console.error("Analytics Error", e);
            }
        };

        logVisit();
    }, []);

    return null;
}
