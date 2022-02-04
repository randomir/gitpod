/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the Gitpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import * as chai from 'chai';
import { suite, test, timeout } from 'mocha-typescript';
import { testContainer } from './test-container';
import { TypeORM } from './typeorm/typeorm';
import { AuthProviderEntryDB } from '.';
import { DBAuthProviderEntry } from './typeorm/entity/db-auth-provider-entry';
import { DeepPartial } from '@gitpod/gitpod-protocol/lib/util/deep-partial';
const expect = chai.expect;

@suite @timeout(5000)
export class AuthProviderEntryDBSpec {

    typeORM = testContainer.get<TypeORM>(TypeORM);
    db = testContainer.get<AuthProviderEntryDB>(AuthProviderEntryDB);

    async before() {
        const connection = await this.typeORM.getConnection();
        const manager = connection.manager;
        await manager.clear(DBAuthProviderEntry);
    }

    async after() {
    }

    protected authProvider(ap: DeepPartial<DBAuthProviderEntry> = {}): DBAuthProviderEntry {
        const ownerId = "1234";
        const host = "github.com";
        return {
            id: "0049b9d2-005f-43c2-a0ae-76377805d8b8",
            host,
            ownerId,
            status: 'verified',
            type: "GitHub",
            oauthRevision: undefined,
            deleted: false,
            ...ap,
            oauth: {
                callBackUrl: "example.org/some/callback",
                authorizationUrl: "example.org/some/auth",
                settingsUrl: "example.org/settings",
                configURL: "example.org/config",
                clientId: "clientId",
                clientSecret: "clientSecret",
                tokenUrl: "example.org/get/token",
                scope: "scope",
                scopeSeparator: ",",
                ...ap.oauth,
                authorizationParams: {},
            },
        };
    }

    @test public async storeEmtpyOAuthRevision() {
        const ap = this.authProvider();
        await this.db.storeAuthProvider(ap);

        const aap = await this.db.findByHost(ap.host);
        expect(aap, "AuthProvider").to.deep.equal(ap);
    }

    @test public async findAll() {
        const ap1 = this.authProvider({ id: "1", oauthRevision: "rev1" });
        const ap2 = this.authProvider({ id: "2", oauthRevision: "rev2" });
        await this.db.storeAuthProvider(ap1);
        await this.db.storeAuthProvider(ap2);

        const all = await this.db.findAll();
        console.log(JSON.stringify(all));
        expect(all, "findAll([])").to.deep.equal([ap1, ap2]);
        expect(await this.db.findAll([ap1.oauthRevision!, ap2.oauthRevision!]), "findAll([ap1, ap2])").to.be.empty;
        expect(await this.db.findAll([ap1.oauthRevision!]), "findAll([ap1])").to.deep.equal([ap2]);
    }
}

module.exports = AuthProviderEntryDBSpec
