/**
 * Feature Flags Configuration
 * 
 * This file controls which features are enabled/disabled in the application.
 * Simply change the values from `false` to `true` to enable features.
 * 
 * To enable all add-on options:
 * - Set all values to `true`
 * 
 * To enable only specific options:
 * - Set individual flags to `true` as needed
 * 
 * Current status: All add-on options are HIDDEN
 */

export const FEATURES = {
  // Add-on Options
  CHARM_OPTION: false,        // "Sac Viet" Charm (+6,000 VND)
  GIFT_BOX_OPTION: false,     // 20.10 Gift Box (+40,000 VND)  
  EXTRA_ITEMS_OPTION: false,  // Extra Items + Gift Packaging (Free)
  
  // Future features can be added here
  // DISCOUNT_CODES: true,     // Discount code system
  // BULK_ORDERS: false,       // Bulk order discounts
} as const;

/**
 * Quick Enable/Disable Commands:
 * 
 * To enable ALL add-on options:
 *   CHARM_OPTION: true,
 *   GIFT_BOX_OPTION: true,
 *   EXTRA_ITEMS_OPTION: true,
 * 
 * To enable only charm option:
 *   CHARM_OPTION: true,
 *   GIFT_BOX_OPTION: false,
 *   EXTRA_ITEMS_OPTION: false,
 * 
 * To enable only gift box + extra items:
 *   CHARM_OPTION: false,
 *   GIFT_BOX_OPTION: true,
 *   EXTRA_ITEMS_OPTION: true,
 */
