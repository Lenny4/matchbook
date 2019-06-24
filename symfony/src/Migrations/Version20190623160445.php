<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190623160445 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE event_json (id INT AUTO_INCREMENT NOT NULL, json LONGTEXT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE event ADD json_id INT DEFAULT NULL, DROP event');
        $this->addSql('ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA76687CF34 FOREIGN KEY (json_id) REFERENCES event_json (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3BAE0AA76687CF34 ON event (json_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA76687CF34');
        $this->addSql('DROP TABLE event_json');
        $this->addSql('DROP INDEX UNIQ_3BAE0AA76687CF34 ON event');
        $this->addSql('ALTER TABLE event ADD event LONGTEXT NOT NULL COLLATE utf8mb4_unicode_ci, DROP json_id');
    }
}
