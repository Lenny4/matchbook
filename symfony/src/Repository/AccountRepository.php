<?php

namespace App\Repository;

use App\Entity\Account;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method Account|null find($id, $lockMode = null, $lockVersion = null)
 * @method Account|null findOneBy(array $criteria, array $orderBy = null)
 * @method Account[]    findAll()
 * @method Account[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AccountRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Account::class);
    }

    public function accountExist($username, $password)
    {
        return sizeof($this->createQueryBuilder('a')
            ->andWhere('a.username = :username')
            ->setParameter('username', $username)
            ->andWhere('a.password = :password')
            ->setParameter('password', $password)
            ->setMaxResults(1)
            ->getQuery()
            ->getResult());
    }

}
