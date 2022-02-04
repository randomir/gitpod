/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

 import { AuthProviderEntry } from "@gitpod/gitpod-protocol";
 import {MigrationInterface, QueryRunner} from "typeorm";
 import { columnExists, indexExists } from "./helper/helper";
 import * as crypto from "crypto";

 const TABLE_NAME = "d_b_auth_provider_entry";
 const COLUMN_NAME: keyof AuthProviderEntry = "oauthRevision";
 const INDEX_NAME = "ind_oauthRevision";

 export class OAuthRevision1643986994402 implements MigrationInterface {

     public async up(queryRunner: QueryRunner): Promise<void> {
         // create new column
         if (!(await columnExists(queryRunner, TABLE_NAME, COLUMN_NAME))) {
             await queryRunner.query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME} varchar(128) NULL`);
         }

         // fill with (random) string
         // note that there is no guarantee that all entries have an oauthRevision after this change as there might be clients writing to this table in parallel
         const entries = await queryRunner.query(`SELECT id, oauth, oauthRevision FROM ${TABLE_NAME}`) as Pick<AuthProviderEntry, "id" | "oauth" | "oauthRevision">[];
         console.log(JSON.stringify(entries));
         console.log(`oauthRevision: check and update...`);
         for (const entry of entries) {
             if (!!entry.oauthRevision) {
                 continue;
             }
             const revision = crypto.randomBytes(20).toString('hex');
             await queryRunner.query(`UPDATE ${TABLE_NAME} SET ${COLUMN_NAME} = ${revision} WHERE id = ${entry.id}`);
         }
         console.log(`oauthRevision: ${entries.length} oauthRevision set.`);

         // create index on said column
         if (!(await indexExists(queryRunner, TABLE_NAME, INDEX_NAME))) {
             await queryRunner.query(`CREATE INDEX ${INDEX_NAME} ON ${TABLE_NAME} (${COLUMN_NAME})`);
         }
     }

     public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`ALTER TABLE ${TABLE_NAME} DROP INDEX ${INDEX_NAME}`);
         await queryRunner.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN ${COLUMN_NAME}`);
     }

 }
