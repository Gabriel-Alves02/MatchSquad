export const ConsultarMediaConsultor = async (request, response, next) => {

  try {

    const { id } = request.params;

    const [mediaConsultor] = await pool.query
        (
          `SELECT AVG(avaliacao) FROM Reuniao
            GROUP BY idConsultor
            HAVING idConsultor = ?;
        `, [id]
        );

      if (mediaConsultor) {
        return response.status(200).json
          ({
            success: true,
            mediaConsultor
          });
      }


    return response.status(201).json({
      success: true,
      message: "Media não encontrada."
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};