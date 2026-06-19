<template>
  <svg 
    width="500" 
    height="500" 
    viewBox="0 0 500 500" 
    xmlns="http://www.w3.org/2000/svg"
    class="dsa-logo"
  >
    <!-- Background circle -->
    <circle cx="250" cy="250" r="230" fill="#0f172a" />
    
    <!-- Stylized data structure nodes + connections -->
    <!-- Central node -->
    <circle cx="250" cy="250" r="38" fill="#6366f1" />
    
    <!-- Surrounding nodes representing structures -->
    <!-- Top -->
    <circle cx="250" cy="120" r="22" fill="#64748b" />
    <line x1="250" y1="170" x2="250" y2="212" stroke="#64748b" stroke-width="8" />
    
    <!-- Bottom -->
    <circle cx="250" cy="380" r="22" fill="#64748b" />
    <line x1="250" y1="288" x2="250" y2="358" stroke="#64748b" stroke-width="8" />
    
    <!-- Left -->
    <circle cx="120" cy="250" r="22" fill="#64748b" />
    <line x1="170" y1="250" x2="212" y2="250" stroke="#64748b" stroke-width="8" />
    
    <!-- Right -->
    <circle cx="380" cy="250" r="22" fill="#64748b" />
    <line x1="288" y1="250" x2="358" y2="250" stroke="#64748b" stroke-width="8" />
    
    <!-- Diagonal nodes for complexity -->
    <circle cx="155" cy="155" r="16" fill="#64748b" />
    <line x1="195" y1="195" x2="228" y2="228" stroke="#64748b" stroke-width="6" />
    
    <circle cx="345" cy="155" r="16" fill="#64748b" />
    <line x1="305" y1="195" x2="272" y2="228" stroke="#64748b" stroke-width="6" />
    
    <circle cx="155" cy="345" r="16" fill="#64748b" />
    <line x1="195" y1="305" x2="228" y2="272" stroke="#64748b" stroke-width="6" />
    
    <circle cx="345" cy="345" r="16" fill="#64748b" />
    <line x1="305" y1="305" x2="272" y2="272" stroke="#64748b" stroke-width="6" />
    
    <!-- DSA Text -->
    <text 
      x="250" 
      y="265" 
      font-family="system-ui, -apple-system, sans-serif" 
      font-size="92" 
      font-weight="700" 
      fill="white" 
      text-anchor="middle" 
      dominant-baseline="middle"
      letter-spacing="-4"
    >DSA</text>
  </svg>
</template>