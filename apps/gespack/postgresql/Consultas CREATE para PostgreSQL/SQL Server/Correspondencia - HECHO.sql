USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Correspondencia]    Script Date: 02/11/2024 11:08:24 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Correspondencia](
	[FECHA] [nvarchar](255) NOT NULL,
	[NUM_CLIENTE] [nvarchar](255) NULL,
	[PEDIDO] [nvarchar](255) NULL,
	[TIPO_CARTA] [nvarchar](255) NULL,
 CONSTRAINT [PK_Correspondencia] PRIMARY KEY CLUSTERED 
(
	[FECHA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


