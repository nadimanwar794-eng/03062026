import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
"""          {/* ── PROFILE FOOTER: CONNECT & SUPPORT (ICON ONLY) ── */}
          <div className="mx-4 mb-6 mt-4 rounded-2xl overflow-hidden" style={{
            background: _light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${_light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
          }}>
            {/* App & Developer Header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${_light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)'}` }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-black" style={{ color: _light ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>
                  {settings?.appName || "IIC"}
                </span>
                <span className="text-[10px]" style={{ color: _light ? '#64748b' : 'rgba(255,255,255,0.4)' }}>
                  Developed by Nadim Anwar
                </span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{
                background: _light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)',
                color: _light ? '#475569' : 'rgba(255,255,255,0.55)',
                letterSpacing: '0.03em',
              }}>v{APP_VERSION || '1.0.1'}</span>
            </div>

            <div className="px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: _light ? '#94a3b8' : 'rgba(255,255,255,0.35)' }}>
                Connect &amp; Support
              </p>

              {/* 4 Icon Buttons Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/918227070298?text=Hello%20Support,%20I%20need%20help%20with%20IIC%20App"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 group"
                  style={{
                    background: _light ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.1)',
                    border: `1px solid ${_light ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <MessageCircle size={18} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: _light ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>WhatsApp</span>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@iic_apk?si=7dxoZZ8-vV6YoitR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 group"
                  style={{
                    background: _light ? 'rgba(244, 63, 94, 0.05)' : 'rgba(244, 63, 94, 0.1)',
                    border: `1px solid ${_light ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                    style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                    <Youtube size={18} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: _light ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>YouTube</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/thenadimanwarx?igsi=Z3hxbXE2dnZ3c3g3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 group"
                  style={{
                    background: _light ? 'rgba(236, 72, 153, 0.05)' : 'rgba(236, 72, 153, 0.1)',
                    border: `1px solid ${_light ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.2)'}`,
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                    style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                    <Instagram size={18} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: _light ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>Instagram</span>
                </a>

                {/* Gmail (Text Hidden - Direct Mail App Trigger) */}
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Support%20Request%20-%20${encodeURIComponent(user.name)}`}
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 group"
                  title="Contact via Email"
                  style={{
                    background: _light ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid ${_light ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                    style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    <Mail size={18} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: _light ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>Email</span>
                </a>
              </div>
            </div>
          </div>""",

"""          {/* ── PROFILE FOOTER: CONNECT & SUPPORT (ICON ONLY) ── */}
          <div className="mx-4 mb-6 mt-4 rounded-2xl bg-[#16192e] border border-slate-800 p-4 space-y-3 shadow-lg">
            {/* App & Developer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-white font-black text-sm">{settings?.appName || 'IIC'}</h3>
                <p className="text-slate-400 text-[11px]">Developed by Nadim Anwar</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                v{APP_VERSION || '1.0.1'}
              </span>
            </div>

            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Connect & Support
            </p>

            {/* 4 Icon Buttons Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* WhatsApp */}
              <a
                href="https://wa.me/918227070298?text=Hello%20Support,%20I%20need%20help%20with%20IIC%20App"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#1e233d] hover:bg-[#252b4a] border border-emerald-500/20 text-slate-200 transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <MessageCircle size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-300">WhatsApp</span>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@iic_apk?si=7dxoZZ8-vV6YoitR"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#1e233d] hover:bg-[#252b4a] border border-rose-500/20 text-slate-200 transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Youtube size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-300">YouTube</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/thenadimanwarx?igsi=Z3hxbXE2dnZ3c3g3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#1e233d] hover:bg-[#252b4a] border border-pink-500/20 text-slate-200 transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-full bg-pink-500/15 text-pink-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Instagram size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-300">Instagram</span>
              </a>

              {/* Gmail (Text Hidden - Direct Mail App Trigger) */}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Support%20Request%20-%20${encodeURIComponent(user.name)}`}
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#1e233d] hover:bg-[#252b4a] border border-blue-500/20 text-slate-200 transition-all active:scale-95 group"
                title="Contact via Email"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Mail size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-300">Email</span>
              </a>
            </div>
          </div>"""
)

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
