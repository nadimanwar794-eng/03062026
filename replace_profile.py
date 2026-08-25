import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Replace lucide-react import list directly to avoid parse errors
content = content.replace(
"""  Loader2,
} from "lucide-react";""",
"""  Loader2,
  MessageCircle,
  Youtube,
  Instagram,
} from "lucide-react";"""
)


search_str = """          {/* App info + Support — unified professional card */}
          <div className="mx-4 mb-6 mt-2 rounded-2xl overflow-hidden" style={{
            background: _light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${_light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
          }}>
            {/* App identity row */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${_light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)'}` }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-black" style={{ color: _light ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>
                  {settings?.appName || "IIC Study App"}
                </span>
                <span className="text-[10px]" style={{ color: _light ? '#64748b' : 'rgba(255,255,255,0.4)' }}>
                  Developed by Nadim Anwar
                </span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{
                background: _light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)',
                color: _light ? '#475569' : 'rgba(255,255,255,0.55)',
                letterSpacing: '0.03em',
              }}>v{APP_VERSION}</span>
            </div>

            {/* Contact & Support row — tappable */}
            <button
              onClick={handleSupportEmail}
              className="w-full px-5 pt-3 pb-4 flex flex-col gap-1.5 text-left active:opacity-60 transition-opacity"
            >
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: _light ? '#94a3b8' : 'rgba(255,255,255,0.35)' }}>
                Contact &amp; Support
              </span>
              <div className="flex items-center gap-2">
                <Mail size={13} style={{ color: _light ? '#6366f1' : 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
                <span className="text-[13px] font-bold" style={{ color: _light ? '#1e293b' : 'rgba(255,255,255,0.88)' }}>
                  {SUPPORT_EMAIL}
                </span>
              </div>
              <span className="text-[10px]" style={{ color: _light ? '#94a3b8' : 'rgba(255,255,255,0.30)' }}>
                Tap to email the developer for help
              </span>
            </button>
          </div>"""

replace_str = """          {/* ── PROFILE FOOTER: CONNECT & SUPPORT (ICON ONLY) ── */}
          <div className="mx-4 mb-6 mt-2 rounded-2xl overflow-hidden" style={{
            background: _light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${_light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
          }}>
            {/* App identity row */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${_light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)'}` }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-black" style={{ color: _light ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>
                  {settings?.appName || "IIC Study App"}
                </span>
                <span className="text-[10px]" style={{ color: _light ? '#64748b' : 'rgba(255,255,255,0.4)' }}>
                  Developed by Nadim Anwar
                </span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{
                background: _light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)',
                color: _light ? '#475569' : 'rgba(255,255,255,0.55)',
                letterSpacing: '0.03em',
              }}>v{APP_VERSION}</span>
            </div>

            <div className="px-5 pt-3 pb-2">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: _light ? '#94a3b8' : 'rgba(255,255,255,0.35)' }}>
                Connect &amp; Support
              </span>
            </div>

            {/* 4 Icon Buttons Grid */}
            <div className="px-5 pb-4 pt-1 grid grid-cols-4 gap-2">
              {/* WhatsApp */}
              <a
                href="https://wa.me/918227070298?text=Hello%20Support,%20I%20need%20help%20with%20IIC%20App"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 group"
                style={{
                  background: _light ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${_light ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.2)'}`,
                }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                  style={{
                    background: _light ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.15)',
                    color: '#10b981'
                  }}>
                  <MessageCircle size={18} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: _light ? '#475569' : 'rgba(255,255,255,0.7)' }}>WhatsApp</span>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@iic_apk?si=7dxoZZ8-vV6YoitR"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 group"
                style={{
                  background: _light ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${_light ? 'rgba(244,63,94,0.15)' : 'rgba(244,63,94,0.2)'}`,
                }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                  style={{
                    background: _light ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.15)',
                    color: '#f43f5e'
                  }}>
                  <Youtube size={18} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: _light ? '#475569' : 'rgba(255,255,255,0.7)' }}>YouTube</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/thenadimanwarx?igsi=Z3hxbXE2dnZ3c3g3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 group"
                style={{
                  background: _light ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${_light ? 'rgba(236,72,153,0.15)' : 'rgba(236,72,153,0.2)'}`,
                }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                  style={{
                    background: _light ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.15)',
                    color: '#ec4899'
                  }}>
                  <Instagram size={18} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: _light ? '#475569' : 'rgba(255,255,255,0.7)' }}>Instagram</span>
              </a>

              {/* Gmail */}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Support%20Request%20-%20${encodeURIComponent(user.name)}`}
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 group"
                title="Contact via Email"
                style={{
                  background: _light ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${_light ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.2)'}`,
                }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                  style={{
                    background: _light ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.15)',
                    color: '#3b82f6'
                  }}>
                  <Mail size={18} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: _light ? '#475569' : 'rgba(255,255,255,0.7)' }}>Email</span>
              </a>
            </div>
          </div>"""

if search_str in content:
    content = content.replace(search_str, replace_str)
    with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Search string not found")
