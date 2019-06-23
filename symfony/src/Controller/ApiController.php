<?php

namespace App\Controller;

use App\Entity\Event;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
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

    /**
     * @Route("/save-event", name="save_event")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function saveEvent(Request $request)
    {
        try {
            $em = $this->getDoctrine()->getManager();
            $eventId = $request->request->get('id');
            $name = $request->request->get('name');
            $start = intval($request->request->get('start'));
            $sportId = $request->request->get('sport-id');
            $event = $request->request->get('event');
            $eventEntity = new Event();
            $eventEntity->setName($name);
            $eventEntity->setStart($start);
            $eventEntity->setEventId($eventId);
            $eventEntity->setSportId($sportId);
            $eventEntity->setEvent(json_encode($event));
            $em->persist($eventEntity);
            $em->flush();
            return $this->json(true);
        } catch (\Exception $e) {
            return $this->json($e);
        }
    }

    /**
     * @Route("/get-all-events", name="get_all_events")
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getAllEvents()
    {
        $em = $this->getDoctrine()->getManager();
        $eventRepository = $em->getRepository("App\Entity\Event");
        return $this->json($eventRepository->getAllEvents());
    }

    /**
     * @Route("/get-event", name="get_event")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getEvent(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $id = $request->request->get('id');
        $eventRepository = $em->getRepository("App\Entity\Event");
        return $this->json($eventRepository->find($id));
    }
}
