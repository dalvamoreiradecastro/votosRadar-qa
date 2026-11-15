/**
 * Years used by the tests, computed at runtime so the suite never goes stale.
 *
 * The year is taken in Brasília time, the time zone of the site and its data.
 * CI runners use UTC, so `new Date().getFullYear()` would already return the next
 * year from 21:00 on December 31 in Brazil, while the site still shows the current one.
 */
const SITE_TIME_ZONE = 'America/Sao_Paulo';

export const CURRENT_YEAR = Number(
  new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: SITE_TIME_ZONE }).format(new Date()),
);

/** The last complete year: its data no longer changes, which makes it the most stable test target. */
export const PREVIOUS_YEAR = CURRENT_YEAR - 1;

/** First year with data on the site (the year selector starts here). */
export const FIRST_YEAR = 2016;
