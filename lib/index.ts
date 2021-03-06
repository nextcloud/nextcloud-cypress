/**
 * @copyright 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { getNc } from "./commands"
import { login, logout } from "./commands/sessions"
import type { Selector } from "./selectors"

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Get an element from the Nextcloud selector set.
			 * @example cy.getNc(FileList)
			 *          cy.getNc(FileRow, { id: fileInfo.id })
			 */
			 getNc(selector: Selector, args?: Object): Cypress.Chainable<JQuery<HTMLElement>>

			 /**
			  * Login on a Nextcloud instance
			  */
			 login(user: string, password: string, route?: string): void

			 /**
			  * Logout from a Nextcloud instance
			  */
			 logout(): void
		}
	}
}

/**
 * Register all existing commands provided by this library
 *
 * You can also manually register those commands by importing them
 * @example import { getNc } from '@nextcloud/cypress/commands'
 *          Cypress.Commands.add('getNc', getNc)
 */
export const addCommands = function() {
	Cypress.Commands.add('getNc', getNc)
	Cypress.Commands.add('login', login)
	Cypress.Commands.add('logout', logout)
}
