# Feature Flags Guide

## Overview
The charm and gift box options are currently **HIDDEN** but can be easily enabled by changing feature flags.

## Quick Enable/Disable

### To Enable ALL Add-on Options:
Edit `config/feature-flags.ts`:
```typescript
export const FEATURES = {
  CHARM_OPTION: true,        // "Sac Viet" Charm (+6,000 VND)
  GIFT_BOX_OPTION: true,     // 20.10 Gift Box (+40,000 VND)  
  EXTRA_ITEMS_OPTION: true,  // Extra Items + Gift Packaging (Free)
} as const;
```

### To Enable Only Specific Options:
```typescript
// Only charm option
CHARM_OPTION: true,
GIFT_BOX_OPTION: false,
EXTRA_ITEMS_OPTION: false,

// Only gift box + extra items
CHARM_OPTION: false,
GIFT_BOX_OPTION: true,
EXTRA_ITEMS_OPTION: true,
```

## Current Status
- ✅ **Charm Option**: HIDDEN (set to `false`)
- ✅ **Gift Box Option**: HIDDEN (set to `false`)  
- ✅ **Extra Items Option**: HIDDEN (set to `false`)

## What Happens When Disabled
- Options are completely hidden from the cart UI
- Price calculation only includes base keychain price (49,000 VND)
- Update functions ignore any changes to these options
- No visual indicators or disabled states shown

## What Happens When Enabled
- Options appear as interactive checkboxes in the cart
- Price calculation includes selected add-ons
- Full functionality for selecting/deselecting options
- Proper price breakdown display

## Files Modified
- `config/feature-flags.ts` - Central configuration
- `components/cart-popup.tsx` - UI conditional rendering
- `contexts/cart-context.tsx` - Logic conditional execution

## Testing
1. Change feature flags to `true`
2. Restart development server: `npm run dev`
3. Add items to cart and verify options appear
4. Test price calculations with different combinations
