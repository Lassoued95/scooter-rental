/**
 * @typedef {string} Locale
 */

/**
 * @typedef {Record<string, string>} LocalizedText
 */

/**
 * @typedef {Record<string, string[]>} LocalizedList
 */

/**
 * @typedef {Object} PriceTier
 * @property {number} minDays
 * @property {number} pricePerDay
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {"rental" | "tour"} type
 * @property {LocalizedText} name
 * @property {LocalizedText} description
 * @property {number} price
 * @property {PriceTier[]} [priceTiers]
 * @property {number} [stock]
 * @property {number} [capacityPerSlot]
 * @property {number} [durationHours]
 * @property {LocalizedList} [highlights]
 * @property {string} [meetingPoint]
 * @property {{ engineCc: number, passengers: number, luggage: number, fuel: LocalizedText }} [specs]
 * @property {boolean} active
 */

/**
 * @typedef {Object} Option
 * @property {string} id
 * @property {LocalizedText} name
 * @property {number} price
 * @property {boolean} active
 */

/**
 * @typedef {Object} Reservation
 * @property {string} id
 * @property {string} productId
 * @property {"rental" | "tour"} type
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} quantity
 * @property {number} totalPrice
 * @property {"PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"} status
 * @property {{ name: string, phone: string, email: string, hotel?: string, message?: string }} customer
 */

/**
 * @typedef {Object} Customer
 * @property {string} name
 * @property {string} phone
 * @property {string} email
 * @property {string} [hotel]
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} author
 * @property {number} rating
 * @property {LocalizedText} text
 * @property {string} date
 */

/**
 * @typedef {Object} Faq
 * @property {string} id
 * @property {LocalizedText} question
 * @property {LocalizedText} answer
 */

/**
 * @typedef {Object} Settings
 * @property {string} businessName
 * @property {string} address
 * @property {string} phone
 * @property {string} whatsapp
 * @property {string} email
 * @property {number} eurToTnd
 * @property {string} cancellationText
 * @property {number} hotelPickupPrice
 * @property {string} facebook
 * @property {string} instagram
 */

/**
 * @typedef {Object} TourSlot
 * @property {string} id
 * @property {string} date
 * @property {string} startTime
 * @property {string} endTime
 * @property {number} capacity
 */

export {};
