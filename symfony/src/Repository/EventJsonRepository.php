<?php

namespace App\Repository;

use App\Entity\EventJson;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method EventJson|null find($id, $lockMode = null, $lockVersion = null)
 * @method EventJson|null findOneBy(array $criteria, array $orderBy = null)
 * @method EventJson[]    findAll()
 * @method EventJson[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EventJsonRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, EventJson::class);
    }
}
