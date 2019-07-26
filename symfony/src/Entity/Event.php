<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\EventRepository")
 */
class Event
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $eventId;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $sportId;

    /**
     * @ORM\Column(type="string", length=50, nullable=true)
     */
    private $winner;

    /**
     * @ORM\Column(type="integer")
     */
    private $start;

    /**
     * @ORM\OneToOne(targetEntity="EventJson", cascade={"persist"})
     */
    private $json;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getEventId(): ?string
    {
        return $this->eventId;
    }

    public function setEventId(string $eventId): self
    {
        $this->eventId = $eventId;

        return $this;
    }

    public function getSportId(): ?string
    {
        return $this->sportId;
    }

    public function setSportId(string $sportId): self
    {
        $this->sportId = $sportId;

        return $this;
    }

    public function getStart(): ?int
    {
        return $this->start;
    }

    public function setStart(int $start): self
    {
        $this->start = $start;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getJson()
    {
        return $this->json;
    }

    /**
     * @param mixed $json
     */
    public function setJson($json): void
    {
        $this->json = $json;
    }

    /**
     * @return mixed
     */
    public function getWinner()
    {
        return $this->winner;
    }

    /**
     * @param mixed $winner
     */
    public function setWinner($winner): void
    {
        $this->winner = $winner;
    }
}
