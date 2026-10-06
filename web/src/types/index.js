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
 * @typedef {Object} RawProductDocument
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [slug]
 * @property {string} [category]
 * @property {string} [engine]
 * @property {string} [fuel]
 * @property {string} [transmission]
 * @property {number} [stock]
 * @property {{ amount: number, currency?: string, unit?: string }} [price]
 * @property {boolean} [active]
 * @property {boolean} [isTestData]
 * @property {number} [order]
 * @property {Record<string, Object<string, string|string[]>>} [translations]
 */

/**
 * @typedef {Object} PriceTier
 * @property {number} minDays
 * @property {number} pricePerDay
 * @property {string} [currency]
 * @property {string} [unit]
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {"vehicle" | "tour" | "free rental"} type
 * @property {string} category
 * @property {string} name
 * @property {string} [tagline]
 * @property {string} description
 * @property {number} price
 * @property {PriceTier[]} [priceTiers]
 * @property {string} [currency]
 * @property {string} [priceUnit]
 * @property {number|null} [stock]
 * @property {number} [capacityPerSlot]
 * @property {number} [durationHours]
 * @property {string[]} [highlights]
 * @property {string} [meetingPoint]
 * @property {Object<string, *>} [specs]
 * @property {Object[]} images
 * @property {boolean} placeholderImage
 * @property {boolean} active
 * @property {number} order
 * @property {boolean} isTestData
 */

/**
 * @typedef {Object} MockProduct
 * @property {string} id
 * @property {string} slug
 * @property {"rental" | "tour"} type
 * @property {LocalizedText} name
 * @property {LocalizedText} description
 * @property {number} [price]
 * @property {PriceTier[]} [priceTiers]
 * @property {number} [stock]
 * @property {number} [capacityPerSlot]
 * @property {number} [durationHours]
 * @property {LocalizedList} [highlights]
 * @property {LocalizedText} [meetingPoint]
 * @property {Object<string, *>} [specs]
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
