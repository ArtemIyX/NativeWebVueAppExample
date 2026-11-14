<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value += 1
}

function reset() {
  count.value = 0
}
</script>

<template>
  <main class="page-shell">
    <section class="counter-card" aria-labelledby="counter-title">
      <div class="card-glow" aria-hidden="true"></div>

      <div class="content">
        <p class="eyebrow"><span class="status-dot"></span>You did it!</p>
        <h1 id="counter-title">A little progress adds up.</h1>
        <p class="description">One click at a time. How far can you go?</p>

        <div class="counter-display" aria-live="polite" aria-atomic="true">
          <span class="counter-label">CURRENT COUNT</span>
          <output class="count-value">{{ count }}</output>
        </div>

        <div class="actions">
          <button class="button button-primary" type="button" @click="increment">
            <span class="plus-icon" aria-hidden="true">+</span>
            Add one
          </button>
          <button class="button button-secondary" type="button" @click="reset">
            <span class="reset-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path
                  d="M3.5 5.5h13M8 5.5V3.75h4V5.5m3.25 0-.6 10.1a1.5 1.5 0 0 1-1.5 1.4h-6.3a1.5 1.5 0 0 1-1.5-1.4l-.6-10.1M8 8.5v5m4-5v5"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                />
              </svg>
            </span>
            Reset
          </button>
        </div>
      </div>

      <p class="card-footnote">Your count lives here, in this session.</p>
    </section>
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');

:root {
  font-family: 'DM Sans', sans-serif;
  color: #f5f7ff;
  background: #0b0d14;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-optical-sizing: auto;
  font-weight: 400;
}

* {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
}

button {
  font: inherit;
}

#app {
  min-height: 100vh;
}

.page-shell {
  display: grid;
  min-height: 100vh;
  padding: 32px 20px;
  place-items: center;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 43%, rgb(35 43 76 / 34%), transparent 48%), #0b0d14;
}

.counter-card {
  position: relative;
  width: min(100%, 470px);
  padding: 48px 52px 24px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 9%);
  border-radius: 26px;
  background: linear-gradient(145deg, rgb(27 30 44 / 97%), rgb(17 19 29 / 98%));
  box-shadow:
    0 32px 90px rgb(0 0 0 / 38%),
    inset 0 1px rgb(255 255 255 / 5%);
  isolation: isolate;
}

.card-glow {
  position: absolute;
  z-index: -1;
  top: -150px;
  right: -95px;
  width: 330px;
  height: 300px;
  border-radius: 50%;
  background: rgb(125 108 255 / 15%);
  filter: blur(75px);
  pointer-events: none;
}

.content {
  position: relative;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 22px;
  color: #b8b3ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9b8cff;
  box-shadow: 0 0 12px rgb(155 140 255 / 85%);
}

h1 {
  max-width: 330px;
  margin: 0;
  font-family: Manrope, sans-serif;
  font-size: clamp(28px, 6vw, 38px);
  font-weight: 700;
  letter-spacing: -0.055em;
  line-height: 1.12;
}

.description {
  margin: 13px 0 34px;
  color: #9b9eae;
  font-size: 15px;
  line-height: 1.6;
}

.counter-display {
  display: flex;
  min-height: 152px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border: 1px solid rgb(255 255 255 / 7%);
  border-radius: 18px;
  background: rgb(7 9 16 / 40%);
}

.counter-label {
  color: #828697;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.count-value {
  margin-top: 2px;
  color: #fff;
  font-family: Manrope, sans-serif;
  font-size: 76px;
  font-weight: 700;
  letter-spacing: -0.08em;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 38px rgb(153 136 255 / 24%);
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
}

.button {
  display: inline-flex;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button:active {
  transform: translateY(0);
}

.button:focus-visible {
  outline: 3px solid rgb(190 181 255 / 75%);
  outline-offset: 3px;
}

.button-primary {
  color: #fff;
  background: linear-gradient(135deg, #7969ef, #6554db);
  box-shadow: 0 8px 22px rgb(104 84 225 / 24%);
}

.button-primary:hover {
  background: linear-gradient(135deg, #897aff, #7564ed);
  box-shadow: 0 11px 26px rgb(104 84 225 / 36%);
}

.plus-icon {
  font-size: 22px;
  font-weight: 400;
  line-height: 0.8;
}

.button-secondary {
  border-color: rgb(255 255 255 / 10%);
  color: #c3c5d1;
  background: rgb(255 255 255 / 3%);
}

.button-secondary:hover {
  border-color: rgb(255 255 255 / 18%);
  color: #fff;
  background: rgb(255 255 255 / 7%);
}

.reset-icon,
.reset-icon svg {
  display: block;
  width: 17px;
  height: 17px;
}

.card-footnote {
  margin: 25px 0 0;
  padding-top: 17px;
  border-top: 1px solid rgb(255 255 255 / 7%);
  color: #747888;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 480px) {
  .counter-card {
    padding: 36px 25px 21px;
  }

  .description {
    margin-bottom: 27px;
  }

  .counter-display {
    min-height: 135px;
  }

  .count-value {
    font-size: 66px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
