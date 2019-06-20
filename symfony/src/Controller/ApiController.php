<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api")
 */
class ApiController extends AbstractController
{
    /**
     * @Route("/demo", name="demo")
     */
    public function index()
    {
        return $this->json(true);
    }
}
