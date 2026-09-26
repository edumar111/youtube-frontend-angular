import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { AssistantService } from '../core/assistant.service';
import { Icon } from './icon';

interface Msg {
  role: 'user' | 'bot';
  text: string;
}

/**
 * Ep. 15 — widget de chat flotante. Consume POST /assistant/chat (vía Kong) del microservicio
 * `assistant` (Spring AI + Claude). El asistente responde usando datos reales del catálogo.
 */
@Component({
  selector: 'app-chat-widget',
  imports: [Icon],
  template: `
    <!-- Botón flotante -->
    <button class="fab" (click)="toggle()" [class.hidden]="open()" aria-label="Abrir asistente">
      <app-icon name="chat" [size]="24" />
    </button>

    @if (open()) {
      <div class="panel">
        <div class="head">
          <div class="title"><span class="avatar">AI</span> Asistente de compras</div>
          <button class="x" (click)="toggle()" aria-label="Cerrar">✕</button>
        </div>

        <div class="body" #scroll>
          @if (messages().length === 0) {
            <div class="hello">
              <p>¡Hola! 👋 Pregúntame por el catálogo.</p>
              <div class="chips">
                @for (s of suggestions; track s) { <button class="chip" (click)="send(s)">{{ s }}</button> }
              </div>
            </div>
          }
          @for (m of messages(); track $index) {
            <div class="msg" [class.user]="m.role === 'user'">
              <div class="bubble">{{ m.text }}</div>
            </div>
          }
          @if (loading()) { <div class="msg"><div class="bubble typing"><span></span><span></span><span></span></div></div> }
        </div>

        <form class="input" (submit)="onSubmit($event)">
          <input [value]="draft()" (input)="draft.set($any($event.target).value)"
                 placeholder="Escribe tu pregunta…" aria-label="Mensaje" [disabled]="loading()" />
          <button type="submit" class="send" [disabled]="loading() || !draft().trim()" aria-label="Enviar">
            <app-icon name="send" [size]="18" />
          </button>
        </form>
      </div>
    }
  `,
  styles: [`
    .fab { position: fixed; right: 22px; bottom: 22px; z-index: 100; width: 58px; height: 58px; border-radius: 50%;
           background: var(--primary); color: #fff; border: none; box-shadow: 0 8px 22px rgba(255,102,0,.4);
           display: grid; place-items: center; cursor: pointer; transition: transform .15s ease, background .15s; }
    .fab:hover { background: var(--primary-600); transform: translateY(-2px); }
    .fab.hidden { display: none; }

    .panel { position: fixed; right: 22px; bottom: 22px; z-index: 100; width: min(380px, calc(100vw - 32px));
             height: min(560px, calc(100vh - 100px)); background: #fff; border: 1px solid var(--border);
             border-radius: 16px; box-shadow: 0 18px 50px rgba(0,0,0,.22); display: flex; flex-direction: column;
             overflow: hidden; animation: pop .18s ease; }
    @keyframes pop { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }
    .head { background: var(--primary); color: #fff; padding: .8rem 1rem; display: flex; align-items: center; justify-content: space-between; }
    .title { display: flex; align-items: center; gap: .55rem; font-weight: 700; }
    .avatar { background: rgba(255,255,255,.25); width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: .72rem; font-weight: 800; }
    .x { background: transparent; border: none; color: #fff; font-size: 1rem; cursor: pointer; }

    .body { flex: 1; overflow-y: auto; padding: 1rem; background: var(--surface-2); display: flex; flex-direction: column; gap: .6rem; }
    .hello { color: var(--muted); font-size: .9rem; }
    .hello p { margin: .2rem 0 .8rem; }
    .chips { display: flex; flex-wrap: wrap; gap: .4rem; }
    .chip { background: #fff; border: 1px solid var(--border); border-radius: 999px; padding: .4rem .7rem;
            font-size: .8rem; color: var(--ink); cursor: pointer; }
    .chip:hover { border-color: var(--primary); color: var(--primary); }

    .msg { display: flex; }
    .msg.user { justify-content: flex-end; }
    .bubble { max-width: 82%; padding: .6rem .8rem; border-radius: 14px; font-size: .9rem; line-height: 1.4;
              background: #fff; border: 1px solid var(--border); color: var(--ink); white-space: pre-wrap; }
    .msg.user .bubble { background: var(--primary); color: #fff; border-color: var(--primary); }
    .typing { display: inline-flex; gap: 4px; }
    .typing span { width: 6px; height: 6px; background: var(--muted); border-radius: 50%; animation: blink 1s infinite; }
    .typing span:nth-child(2){ animation-delay: .2s; } .typing span:nth-child(3){ animation-delay: .4s; }
    @keyframes blink { 0%,60%,100%{opacity:.2;} 30%{opacity:1;} }

    .input { display: flex; gap: .5rem; padding: .7rem; border-top: 1px solid var(--border); background: #fff; }
    .input input { flex: 1; border: 1px solid var(--border); border-radius: 999px; padding: .6rem .9rem;
                   font-family: var(--font-ui); font-size: .9rem; color: var(--ink); background: var(--surface-2); }
    .input input:focus { outline: none; border-color: var(--primary); background: #fff; }
    .send { background: var(--primary); color: #fff; border: none; width: 40px; height: 40px; border-radius: 50%;
            display: grid; place-items: center; cursor: pointer; }
    .send:disabled { opacity: .5; cursor: default; }
  `],
})
export class ChatWidget {
  private readonly assistant = inject(AssistantService);
  @ViewChild('scroll') private scroll?: ElementRef<HTMLElement>;

  readonly open = signal(false);
  readonly messages = signal<Msg[]>([]);
  readonly draft = signal('');
  readonly loading = signal(false);
  readonly suggestions = ['¿Qué productos tienen?', '¿Cuál es el más barato?', '¿Hay stock de zapatillas?'];

  toggle(): void { this.open.set(!this.open()); }

  onSubmit(e: Event): void {
    e.preventDefault();
    this.send(this.draft());
  }

  send(text: string): void {
    const msg = text.trim();
    if (!msg || this.loading()) return;
    this.messages.update((m) => [...m, { role: 'user', text: msg }]);
    this.draft.set('');
    this.loading.set(true);
    this.scrollDown();

    this.assistant.chat(msg).subscribe({
      next: (r) => {
        this.messages.update((m) => [...m, { role: 'bot', text: r.answer ?? '(sin respuesta)' }]);
        this.loading.set(false);
        this.scrollDown();
      },
      error: () => {
        this.messages.update((m) => [...m, { role: 'bot', text: 'El asistente no está disponible ahora mismo. Intenta más tarde.' }]);
        this.loading.set(false);
        this.scrollDown();
      },
    });
  }

  private scrollDown(): void {
    setTimeout(() => { const el = this.scroll?.nativeElement; if (el) el.scrollTop = el.scrollHeight; }, 30);
  }
}
