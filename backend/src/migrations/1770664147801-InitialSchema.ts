import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770664147801 implements MigrationInterface {
    name = 'InitialSchema1770664147801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone_number" character varying(50) NOT NULL, "national_id" character varying(100), "internal_notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bf14b22e55d577d5834fcf886b" ON "customers" ("full_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8fcf679692db1c886e7f15d2b" ON "customers" ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a8fcf679692db1c886e7f15d2b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf14b22e55d577d5834fcf886b"`);
        await queryRunner.query(`DROP TABLE "customers"`);
    }

}
